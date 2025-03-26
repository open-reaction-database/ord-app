# Copyright 2025 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""An AWS Python Pulumi program."""

import json

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

backend = pulumi.StackReference("ord/backend/prod")


current = aws.get_caller_identity()
key = aws.kms.Key(
    "key",
    customer_master_key_spec="ECC_NIST_P256",
    deletion_window_in_days=7,
    key_usage="SIGN_VERIFY",
    policy=json.dumps(
        {
            "Statement": [
                {
                    "Action": [
                        "kms:DescribeKey",
                        "kms:GetPublicKey",
                        "kms:Sign",
                        "kms:Verify",
                    ],
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "dnssec-route53.amazonaws.com",
                    },
                    "Resource": "*",
                    "Sid": "Allow Route 53 DNSSEC Service",
                },
                {
                    "Action": "kms:*",
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": f"arn:aws:iam::{current.account_id}:root",
                    },
                    "Resource": "*",
                    "Sid": "Enable IAM User Permissions",
                },
            ],
            "Version": "2012-10-17",
        }
    ),
)
zone = aws.route53.Zone("zone", name="open-reaction-database.com")
key_signing_key = aws.route53.KeySigningKey(
    "key_signing_key", hosted_zone_id=zone.id, key_management_service_arn=key.arn
)
hosted_zone_dns_sec = aws.route53.HostedZoneDnsSec(
    "hosted_zone_dns_sec",
    hosted_zone_id=key_signing_key.hosted_zone_id,
    opts=pulumi.ResourceOptions(depends_on=[key_signing_key]),
)

records = []


def create_records(options: list[aws.acm.CertificateDomainValidationOptionArgs]) -> None:
    for i, value in enumerate(options):
        records.append(
            aws.route53.Record(
                f"record-{i}",
                allow_overwrite=True,
                name=value.resource_record_name,
                records=[value.resource_record_value],
                ttl=300,
                type=aws.route53.RecordType(value.resource_record_type),
                zone_id=zone.zone_id,
            )
        )


certificate = aws.acm.Certificate("certificate", domain_name="open-reaction-database.com", validation_method="DNS")
certificate.domain_validation_options.apply(create_records)
certificate_validation = aws.acm.CertificateValidation(
    "certificate_validation",
    certificate_arn=certificate.arn,
    validation_record_fqdns=[record.fqdn for record in records],
)

target_group = aws.lb.TargetGroup(
    "target-group", port=8080, protocol="HTTP", target_type="ip", vpc_id=backend.get_output("vpc_id")
)
load_balancer = awsx.lb.ApplicationLoadBalancer(
    "load-balancer",
    listeners=[
        awsx.lb.ListenerArgs(
            default_actions=[
                aws.lb.ListenerDefaultActionArgs(
                    type="redirect",
                    redirect=aws.lb.ListenerDefaultActionRedirectArgs(
                        port="443", protocol="HTTPS", status_code="HTTP_301"
                    ),
                )
            ],
            port=80,
            protocol="HTTP",
        ),
        awsx.lb.ListenerArgs(
            certificate_arn=certificate_validation.certificate_arn,
            default_actions=[aws.lb.ListenerDefaultActionArgs(type="forward", target_group_arn=target_group.arn)],
            port=443,
            protocol="HTTPS",
        ),
    ],
    subnet_ids=backend.get_output("public_subnet_ids"),
)

aws.route53.Record(
    "alias",
    aliases=[
        aws.route53.RecordAliasArgs(
            evaluate_target_health=False,
            name=load_balancer.load_balancer.dns_name,
            zone_id=load_balancer.load_balancer.zone_id,
        )
    ],
    name="open-reaction-database.com",
    type=aws.route53.RecordType.A,
    zone_id=zone.zone_id,
)

pulumi.export("target_group_arn", target_group.arn)
