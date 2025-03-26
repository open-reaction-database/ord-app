"""An AWS Python Pulumi program."""

import json

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

backend = pulumi.StackReference("ord/backend/prod")
domain = pulumi.StackReference("ord/domain/prod")

repository = awsx.ecr.Repository(
    "repository",
    awsx.ecr.RepositoryArgs(force_delete=True),
)

image = awsx.ecr.Image(
    "image",
    awsx.ecr.ImageArgs(
        repository_url=repository.url,
        context="../../../ord-interface",
        dockerfile="../../../ord-interface/ord_interface/Dockerfile",
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
            from_port=8080,
            to_port=8080,
            protocol="tcp",
            cidr_blocks=[aws.ec2.get_vpc(id=backend.get_output("vpc_id")).cidr_block],
        )
    ],
    vpc_id=backend.get_output("vpc_id"),
)

cluster = aws.ecs.Cluster("cluster")

github_client = json.loads(aws.secretsmanager.get_secret_version("github-client").secret_string)

service = awsx.ecs.FargateService(
    "service",
    awsx.ecs.FargateServiceArgs(
        cluster=cluster.arn,
        load_balancers=[
            aws.ecs.ServiceLoadBalancerArgs(
                container_name="container", container_port=8080, target_group_arn=domain.get_output("target_group_arn")
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
                port_mappings=[awsx.ecs.TaskDefinitionPortMappingArgs(container_port=8080, host_port=8080)],
                # TODO(skearnes): Use `secrets` as well; requires an updated execution role with secrets access.
                environment=[
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="POSTGRES_HOST", value=backend.get_output("rds_endpoint")
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(name="POSTGRES_USER", value="ord"),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="POSTGRES_PASSWORD",
                        value=aws.secretsmanager.get_secret_version(
                            backend.get_output("rds_password_secret_arn")
                        ).secret_string,
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(name="POSTGRES_DATABASE", value="ord"),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(name="GH_CLIENT_ID", value=github_client["GH_CLIENT_ID"]),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="GH_CLIENT_SECRET", value=github_client["GH_CLIENT_SECRET"]
                    ),
                ],
            ),
        ),
    ),
)
