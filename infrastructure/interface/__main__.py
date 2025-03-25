"""An AWS Python Pulumi program."""

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

stack = pulumi.StackReference(f"ord/backend/prod")

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

cluster = aws.ecs.Cluster("cluster")
lb = awsx.lb.ApplicationLoadBalancer(
    "lb",
    subnet_ids=stack.get_output("public_subnet_ids"),
)

ecs_security_group = aws.ec2.SecurityGroup(
    "ecs_security_group",
    vpc_id=stack.get_output("vpc_id"),
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

service = awsx.ecs.FargateService(
    "service",
    awsx.ecs.FargateServiceArgs(
        cluster=cluster.arn,
        network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
            subnets=stack.get_output("private_subnet_ids"),
            security_groups=[ecs_security_group.id],
        ),
        task_definition_args=awsx.ecs.FargateServiceTaskDefinitionArgs(
            container=awsx.ecs.TaskDefinitionContainerDefinitionArgs(
                name="ord",
                image=image.image_uri,
                cpu=512,
                memory=128,
                essential=True,
                port_mappings=[
                    awsx.ecs.TaskDefinitionPortMappingArgs(
                        container_port=80,
                        target_group=lb.default_target_group,
                    )
                ],
            ),
        ),
    ),
)
