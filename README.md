# ord-app

## Local development

1. Install dependencies

   * PostgreSQL
   * Python >= 3.10

2. Install the package

    ```shell
    git clone git@github.com:open-reaction-database/ord-app.git
    cd ord-app
    pythom -m pip install -e ".[tests]"
    ```

3. Run the FastAPI server

    ```shell
    cd ord_app/service_api
    ORD_APP_TESTING=TRUE fastapi dev main.py
    ```
    
    This creates a test PostgreSQL database and starts the server at http://localhost:8000. Navigate to
    http://localhost:8000/docs for the interactive Swagger docs.

## Code style

Formatting and linting run through [pre-commit](https://pre-commit.com): license headers via
[`addlicense`](https://github.com/google/addlicense), Python via [Ruff](https://docs.astral.sh/ruff/), and the UI via
Prettier/ESLint/Stylelint. Install the hooks once after cloning (and run `npm ci` in `ui/` so the UI hooks can find
their tools):

```shell
uv run pre-commit install
```

Run them against the whole tree at any time with `uv run pre-commit run --all-files`.

## Run in Docker
### docker-compose
`docker-compose.yml` is intended for local development: it starts the Back-End
and Database with `APP_ENV=localhost` and `ORD_APP_E2E=true` (Auth0 bypass on
the API).

```shell
docker compose up -d
```

At the same time, run the Front-End separately. Copy the env template, enable
the local Auth0 bypass, then start Vite:

```shell
cd ui
cp .env.template .env
```

In `ui/.env`, uncomment:

```
VITE_E2E_NO_AUTH=TRUE
```

(`VITE_API_ENDPOINT` is already set in the template. Leave `VITE_E2E_DEV_TOKEN`
commented unless you need a custom value; it defaults to `e2e-dev-token`.)

```shell
npm ci
npm run dev
```

Open http://localhost:5173. Both the UI `VITE_E2E_NO_AUTH` flag and the API
`ORD_APP_E2E` setting are required; otherwise the app stays on “Loading…”.

### Single docker file
Or run the Front-End and Back-End in a single Dockerfile.

_Note: the database must be on the same network as docker or docker must connect to the external database (and have access)_

1. Build the Docker image
   ```shell
   docker build -f Dockerfile.single -t ord . 
   ```
2. Run the Docker image
   ```shell
   docker run \
   --network ord_network \
   -e VITE_API_ENDPOINT="http://localhost:8000/service_api/api/v1" \
   -e VITE_AUTH0_DOMAIN="..." \
   -e VITE_AUTH0_CLIENT_ID="..." \
   -e VITE_AUTH0_AUDIENCE="..." \
   -e VITE_AUTH0_ISSUER="..." \
   -e PG_DSN="postgresql+asyncpg://ord@db:5432/ord"
   --rm -p 5173:5173 -p 8000:8000 ord
   ```

Envs for backend:

| Name                    | Description                                        | Required | Default                                                 |
|-------------------------|----------------------------------------------------|----------|---------------------------------------------------------|
| `pg_dsn`                | DSN for connecting to the database                 | false    | `postgresql+psycopg://ord@localhost:5400/ord`           |
| `cors_origins`          | Allowed origins                                    | false    | `["http://localhost:5173"]`                             |
| `app_env`               | Manages the application context (debug parameters) | false    | `production` (available: `localhost`, `production`)     |
| `ord_app_e2e`           | Dev/test Auth0 bypass (only if `app_env=localhost`) | false   | `false` (`true` in `docker-compose.yml`)                |
| `vite_auth0_domain`     | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_algorithms` | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_audience`   | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_issuer`     | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_client_id`  | Auth0 config                                       | true     | -                                                       |


## Testing

Python tests are written with `pytest`:

```shell
pytest -vv
```
