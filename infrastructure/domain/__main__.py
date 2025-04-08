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
from functools import partial

import pulumi
import pulumi_aws as aws

backend = pulumi.StackReference("ord/backend/prod")

DOMAIN = "open-reaction-database.org"

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
zone = aws.route53.Zone("zone", name=DOMAIN)
key_signing_key = aws.route53.KeySigningKey(
    "key_signing_key", hosted_zone_id=zone.id, key_management_service_arn=key.arn
)
hosted_zone_dns_sec = aws.route53.HostedZoneDnsSec(
    "hosted_zone_dns_sec",
    hosted_zone_id=key_signing_key.hosted_zone_id,
    opts=pulumi.ResourceOptions(depends_on=[key_signing_key]),
)

records = []
wildcard_records = []


def create_records(options: list[aws.acm.CertificateDomainValidationOptionArgs], wildcard: bool) -> None:
    for i, value in enumerate(options):
        if wildcard:
            name = f"wildcard-record-{i}"
        else:
            name = f"record-{i}"
        record = aws.route53.Record(
            name,
            allow_overwrite=True,
            name=value.resource_record_name,
            records=[value.resource_record_value],
            ttl=300,
            type=aws.route53.RecordType(value.resource_record_type),
            zone_id=zone.zone_id,
        )
        if wildcard:
            wildcard_records.append(record)
        else:
            records.append(record)


# NOTE(skearnes): If you have trouble with domain validation, make sure that the
# hosted zone NS records match the name servers for the registered domain (or vice versa).
certificate = aws.acm.Certificate("certificate", domain_name=DOMAIN, validation_method="DNS")
certificate.domain_validation_options.apply(partial(create_records, wildcard=False))
certificate_validation = aws.acm.CertificateValidation(
    "certificate_validation",
    certificate_arn=certificate.arn,
    validation_record_fqdns=[record.fqdn for record in records],
)
wildcard_certificate = aws.acm.Certificate("wildcard_certificate", domain_name=f"*.{DOMAIN}", validation_method="DNS")
wildcard_certificate.domain_validation_options.apply(partial(create_records, wildcard=True))
wildcard_certificate_validation = aws.acm.CertificateValidation(
    "wildcard_certificate_validation",
    certificate_arn=wildcard_certificate.arn,
    validation_record_fqdns=[record.fqdn for record in wildcard_records],
)

# Google Workspace.
aws.route53.Record(
    "google_workspace_txt",
    allow_overwrite=True,
    name=DOMAIN,
    records=["google-site-verification=QUbl7fR2jQq9scO7YnphfquwrZL0A90K8vfnJbo3hA4"],
    ttl=300,
    type=aws.route53.RecordType.TXT,
    zone_id=zone.zone_id,
)
aws.route53.Record(
    "google_workspace_mx",
    allow_overwrite=True,
    name=DOMAIN,
    records=["1 smtp.google.com."],
    ttl=300,
    type=aws.route53.RecordType.MX,
    zone_id=zone.zone_id,
)

pulumi.export("certificate_arn", certificate_validation.certificate_arn)
pulumi.export("wildcard_certificate_arn", wildcard_certificate_validation.certificate_arn)
pulumi.export("domain_name", DOMAIN)
pulumi.export("zone_id", zone.zone_id)
