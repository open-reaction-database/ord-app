"""An AWS Python Pulumi program."""

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
import pulumi_random as random


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
            from_port=5432,
            to_port=5432,
            protocol="tcp",
            cidr_blocks=[vpc.vpc.cidr_block],
        )
    ],
    vpc_id=vpc.vpc_id,
)

cluster_subnet_group = aws.rds.SubnetGroup("cluster_subnet_group", subnet_ids=vpc.private_subnet_ids)

rds_password = random.RandomPassword("rds_password", length=16, special=True, override_special="!#$%&*()-_=+[]{}<>:?")

cluster = aws.rds.Cluster(
    "cluster",
    cluster_identifier="cluster",
    apply_immediately=True,
    database_name="ord",
    db_subnet_group_name=cluster_subnet_group.name,
    engine=aws.rds.EngineType.AURORA_POSTGRESQL,
    engine_mode=aws.rds.EngineMode.PROVISIONED,
    master_username="ord",
    master_password=rds_password.result,
    skip_final_snapshot=True,
    storage_encrypted=True,
    serverlessv2_scaling_configuration=aws.rds.ClusterServerlessv2ScalingConfigurationArgs(
        min_capacity=0,
        max_capacity=1,
        seconds_until_auto_pause=3600,
    ),
    vpc_security_group_ids=[cluster_security_group.id],
)

rds_secret = aws.secretsmanager.Secret("rds_secret")
aws.secretsmanager.SecretVersion(
    "rds_secret_version",
    aws.secretsmanager.SecretVersionArgs(
        secret_id=rds_secret.id,
        secret_string=pulumi.Output.format(
            "psycopg+postgresql://ord:{0}@{1}:5432/app", rds_password.result, cluster.endpoint
        ),
    ),
)

cluster_instance = aws.rds.ClusterInstance(
    "cluster_instance",
    identifier="cluster-instance-0",
    cluster_identifier=cluster.id,
    engine=cluster.engine,
    engine_version=cluster.engine_version,
    instance_class="db.serverless",
)

dev_security_group = aws.ec2.SecurityGroup(
    "dev_security_group",
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
            from_port=22,
            to_port=22,
            protocol="tcp",
            cidr_blocks=["0.0.0.0/0"],
            ipv6_cidr_blocks=["::/0"],
        )
    ],
    vpc_id=vpc.vpc_id,
)

pulumi.export("vpc_id", vpc.vpc_id)
pulumi.export("public_subnet_ids", vpc.public_subnet_ids)
pulumi.export("private_subnet_ids", vpc.private_subnet_ids)
pulumi.export("rds_secret_arn", rds_secret.arn)
