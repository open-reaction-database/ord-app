"""An AWS Python Pulumi program."""

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

backend = pulumi.StackReference("ord/backend/prod")

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

lb = awsx.lb.ApplicationLoadBalancer(
    "lb",
    default_target_group_port=8080,
    subnet_ids=backend.get_output("public_subnet_ids"),
)

security_group = aws.ec2.SecurityGroup(
    "security_group",
    vpc_id=backend.get_output("vpc_id"),
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            from_port=0,
            to_port=0,
            protocol="-1",
            cidr_blocks=["0.0.0.0/0"],
            ipv6_cidr_blocks=["::/0"],
        )
    ],
)

cluster = aws.ecs.Cluster("cluster")

service = awsx.ecs.FargateService(
    "service",
    awsx.ecs.FargateServiceArgs(
        cluster=cluster.arn,
        network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
            subnets=backend.get_output("private_subnet_ids"),
            security_groups=[security_group.id],
        ),
        task_definition_args=awsx.ecs.FargateServiceTaskDefinitionArgs(
            container=awsx.ecs.TaskDefinitionContainerDefinitionArgs(
                name="ord",
                image=image.image_uri,
                cpu=4096,
                memory=8192,
                essential=True,
                port_mappings=[
                    awsx.ecs.TaskDefinitionPortMappingArgs(
                        container_port=8080,
                        host_port=8080,
                        target_group=lb.default_target_group,
                    )
                ],
                # TODO(skearnes): Use `secrets` for PG_DSN; requires an updated execution role with secrets access.
                environment=[
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="PG_DSN",
                        value=aws.secretsmanager.get_secret_version(
                            backend.get_output("rds_dsn_secret_arn")
                        ).secret_string,
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="VITE_API_ENDPOINT", value="http://localhost:8000/service_api/api/v1"
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="VITE_AUTH0_DOMAIN", value="dev-z4acb31kcl4prqtw.us.auth0.com"
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="VITE_AUTH0_CLIENT_ID", value="6iGbDSlSANtgqktlxmERNKUUM8zx89TR"
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="VITE_AUTH0_AUDIENCE", value="https://dev-z4acb31kcl4prqtw.us.auth0.com/api/v2/"
                    ),
                    awsx.ecs.TaskDefinitionKeyValuePairArgs(
                        name="VITE_AUTH0_ISSUER", value="https://dev-z4acb31kcl4prqtw.us.auth0.com/"
                    ),
                ],
            ),
        ),
    ),
)
