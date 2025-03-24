"""An AWS Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx


vpc = awsx.ec2.Vpc(
    "vpc",
    awsx.ec2.VpcArgs(
        nat_gateways=awsx.ec2.NatGatewayConfigurationArgs(
            strategy=awsx.ec2.NatGatewayStrategy.SINGLE,
        ),
    ),
)

cluster_security_group = aws.ec2.SecurityGroup(
    "cluster_security_group",
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            cidr_blocks=[vpc.vpc.cidr_block],
            from_port=5432,
            protocol="tcp",
            to_port=5432,
        )
    ],
    vpc_id=vpc.vpc_id,
)

cluster_subnet_group = aws.rds.SubnetGroup("cluster_subnet_group", subnet_ids=vpc.private_subnet_ids)

cluster = aws.rds.Cluster(
    "cluster",
    apply_immediately=True,
    db_subnet_group_name=cluster_subnet_group.name,
    engine=aws.rds.EngineType.AURORA_POSTGRESQL,
    engine_mode=aws.rds.EngineMode.PROVISIONED,
    manage_master_user_password=True,
    master_username="ord",
    storage_encrypted=True,
    serverlessv2_scaling_configuration=aws.rds.ClusterServerlessv2ScalingConfigurationArgs(
        max_capacity=1,
        min_capacity=0,
        seconds_until_auto_pause=3600,
    ),
    vpc_security_group_ids=[cluster_security_group.id],
)

dev_security_group = aws.ec2.SecurityGroup(
    "dev_security_group",
    egress=[
        aws.ec2.SecurityGroupEgressArgs(
            cidr_blocks=["0.0.0.0/0"],
            from_port=0,
            to_port=0,
            protocol="-1",
        )
    ],
    ingress=[
        aws.ec2.SecurityGroupIngressArgs(
            cidr_blocks=["0.0.0.0/0"],
            from_port=22,
            to_port=22,
            protocol="tcp",
        )
    ],
    vpc_id=vpc.vpc_id,
)

pulumi.export("vpc_id", vpc.vpc_id)
pulumi.export("public_subnet_ids", vpc.public_subnet_ids)
pulumi.export("private_subnet_ids", vpc.private_subnet_ids)
