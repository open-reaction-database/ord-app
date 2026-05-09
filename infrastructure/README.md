# infrastructure

Pulumi stacks that provision the AWS infrastructure for ord-app.

## Layout

| Project | Purpose |
| --- | --- |
| [domain/](domain/) | Route 53 hosted zone and ACM certificates |
| [backend/](backend/) | VPC, RDS Aurora, Redis, bastion ([README](backend/README.md)) |
| [app/](app/) | ECS service, ALB, task definitions for ord-app |
| [interface/](interface/) | CloudFront / public-facing edge config |

Each project has its own stack (`ord/prod`) and is deployed independently.

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/install/) (currently using 3.220+)
- AWS CLI configured for SSO
- Python 3.12+

## One-time setup

### Authenticate

```sh
aws sso login
pulumi login
```

SSO credentials expire periodically — re-run `aws sso login` when Pulumi reports
`Failed to refresh cached SSO credentials`.

### Python environment

Each Pulumi project has its own `requirements.txt`. The cleanest way to keep
Pulumi's deps from colliding with the workspace `.venv` (which would pin a
different `protobuf` than `ord-schema` requires) is a per-project virtualenv:

```sh
cd infrastructure/<project>
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Then add this to that project's `Pulumi.yaml` so Pulumi auto-uses it:

```yaml
runtime:
  name: python
  options:
    virtualenv: venv
```

> **Heads up:** if you instead `pip install -r requirements.txt` into the root
> workspace `.venv`, it will upgrade `protobuf` to v6 and break `ord-schema`
> (which pins `<5`). Use a per-project venv.

## Deploying

From any project directory:

```sh
pulumi preview --stack ord/prod   # show planned changes
pulumi up      --stack ord/prod   # apply
```

Always run `preview` first and review the diff. The `prod` stack is the only
stack that exists today — there is no separate dev/staging.

## Inspecting state

```sh
pulumi stack ls                   # list stacks
pulumi stack output --stack ord/prod          # all stack outputs
pulumi stack output --stack ord/prod --show-secrets <name>   # include secrets
```

The Pulumi Cloud console is at <https://app.pulumi.com/ord>.

## Recommended deploy order

When bringing the stacks up from scratch:

1. `domain` — DNS + certs
2. `backend` — VPC, database, cache (other stacks depend on its outputs via stack references)
3. `app`
4. `interface`

For routine changes, deploy only the project you modified.
