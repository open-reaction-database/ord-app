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

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

backend = pulumi.StackReference("ord/backend/prod")
domain = pulumi.StackReference("ord/domain/prod")

target_group = aws.lb.TargetGroup(
    "target-group", port=5173, protocol="HTTP", target_type="ip", vpc_id=backend.get_output("vpc_id")
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
            certificate_arn=domain.get_output("wildcard_certificate_arn"),
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
    name=domain.get_output("domain_name").apply(lambda name: f"app.{name}"),
    type=aws.route53.RecordType.A,
    zone_id=domain.get_output("zone_id"),
)

repository = awsx.ecr.Repository(
    "repository",
    awsx.ecr.RepositoryArgs(force_delete=True),
)

image = awsx.ecr.Image(
    "image",
    awsx.ecr.ImageArgs(
        repository_url=repository.url,
        context="../..",
        dockerfile="../../Dockerfile.single",
        platform="linux/amd64",
    ),
)

security_group = aws.ec2.SecurityGroup(
    "security_group",
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            from_port=0,
            to_port=0,
            protocol="-1",
            cidr_blocks=["0.0.0.0/0"],
            ipv6_cidr_blocks=["::/0"],
        )
    ],
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            from_port=5173,
            to_port=5173,
            protocol="tcp",
            cidr_blocks=[aws.ec2.get_vpc_output(id=backend.get_output("vpc_id")).cidr_block],
        )
    ],
    vpc_id=backend.get_output("vpc_id"),
)

cluster = aws.ecs.Cluster("cluster")

service = awsx.ecs.FargateService(
    "service",
    awsx.ecs.FargateServiceArgs(
        cluster=cluster.arn,
        load_balancers=[
            aws.ecs.ServiceLoadBalancerArgs(
                container_name="container", container_port=5173, target_group_arn=target_group.arn
            )
        ],
        network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
            subnets=backend.get_output("private_subnet_ids"),
            security_groups=[security_group.id],
        ),
        task_definition_args=awsx.ecs.FargateServiceTaskDefinitionArgs(
            container=awsx.ecs.TaskDefinitionContainerDefinitionArgs(
                name="container",
                image=image.image_uri,
                cpu=4096,
                memory=8192,
                essential=True,
                port_mappings=[awsx.ecs.TaskDefinitionPortMappingArgs(container_port=5173, host_port=5173)],
                # TODO(skearnes): Use `secrets` for PG_DSN; requires an updated execution role with secrets access.
                environment=[
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="PG_DSN",
                        value=aws.secretsmanager.get_secret_version_output(
                            secret_id=backend.get_output("rds_dsn_secret_arn")
                        ).secret_string,
                    ),
                ],
            ),
        ),
    ),
)
