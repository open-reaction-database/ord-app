# backend

Pulumi stack for the backend AWS infrastructure: VPC, RDS Aurora cluster, Redis, and a bastion for local DB access.

## Connecting to RDS from a local client (DataGrip, psql, etc.)

The RDS cluster has no public endpoint. A `t4g.nano` bastion in a private subnet forwards traffic to it via AWS Systems Manager — no SSH, no public IP, no inbound ports. Access is gated by IAM.

### One-time setup

Install the SSM Session Manager plugin:

```sh
brew install --cask session-manager-plugin
```

Make sure your AWS CLI credentials are configured for the account this stack is deployed to.

### Start the tunnel

```sh
BASTION=$(pulumi -C infrastructure/backend stack output bastion_instance_id)
RDS=$(pulumi -C infrastructure/backend stack output rds_endpoint)
aws ssm start-session \
  --target "$BASTION" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$RDS\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"15432\"]}"
```

Leave that running. Local port `15432` is now forwarded to the RDS endpoint on `5432`.

### Connect

In DataGrip (or any PostgreSQL client):

- Host: `localhost`
- Port: `15432`
- Database: `ord`
- User: `ord`
- Password: pulled from the `rds_password` secret in AWS Secrets Manager. To fetch it:

  ```sh
  aws secretsmanager get-secret-value \
    --secret-id "$(pulumi -C infrastructure/backend stack output rds_password_secret_arn)" \
    --query SecretString --output text
  ```

### Cost note

The bastion runs 24/7 at roughly $3/mo. To pause it when you're not using it:

```sh
aws ec2 stop-instances --instance-ids "$BASTION"
aws ec2 start-instances --instance-ids "$BASTION"
```
