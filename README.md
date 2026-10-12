# ord-app

## Local development

1. Install dependencies

   * PostgreSQL
   * Python 3.12 and [uv](https://docs.astral.sh/uv/)

2. Install the package

    ```shell
    git clone git@github.com:open-reaction-database/ord-app.git
    cd ord-app
    uv sync --directory backend/editor --frozen
    ```

3. Run the FastAPI server

    ```shell
    cd backend/editor
    uv run alembic upgrade head
    APP_ENV=localhost uv run uvicorn ord_editor.service_api.main:app --reload
    ```

    The server starts at http://localhost:8000 against the Postgres that `PG_DSN` names (default: the docker-compose database on localhost:5400), and `alembic upgrade head` creates its schema. Navigate to http://localhost:8000/service_api/docs for the interactive Swagger docs.

### Viewer backend

The viewer's backend is a separate uv project that serves one corpus directory and needs no Postgres.

```shell
cd backend/viewer && uv sync --frozen
uv run pytest -n auto
ORD_VIEWER_CORPUS_DIR=<corpus> uv run uvicorn ord_viewer.main:app --port 8001
```

Opening a full corpus takes about 40 s and 7 GiB. The API docs are at http://localhost:8001/api/docs.

ord-schema's derive scripts (`ord_schema.artifacts.scripts.derive_projection`, `derive_structures`, `derive_pivots`, and `derive_occurrences`) produce a corpus's trees from source Parquet. For a local smoke run, `ord_viewer.testing.derive_corpus(path)` writes the five-reaction test corpus:

```shell
uv run python -c "import pathlib; from ord_viewer.testing import derive_corpus; derive_corpus(pathlib.Path('/tmp/corpus'))"
```

## Code style

Formatting and linting run through [pre-commit](https://pre-commit.com): license headers via
[`addlicense`](https://github.com/google/addlicense), Python via [Ruff](https://docs.astral.sh/ruff/), and the UI via
Prettier/ESLint/Stylelint. Install the hooks once after cloning (and run `npm ci` in `frontend/` so the UI hooks can
find their tools):

```shell
uvx pre-commit install
```

`uvx pre-commit install` records a Python inside uv's cache, so clearing that cache breaks the hook; installing pre-commit as a tool (`uv tool install pre-commit`, then `pre-commit install`) gives a hook that survives it.

Run them against the whole tree at any time with `uvx pre-commit run --all-files`.

## Run in Docker
### docker-compose
You can run the Back-End and the Database using a single docker-compose file.
```shell
docker compose up -d
```
At the same time, you need to run the Front-End separately.
```shell
cd frontend
```

```shell
npm ci
```

```shell
npm run dev -w apps/editor
```

The frontend lives in `frontend/`, an npm workspace with the editor in `frontend/apps/editor/`. A checkout from before
the move may still hold an untracked `ui/` directory (`ui/node_modules`, `ui/.env`): move `ui/.env` to
`frontend/apps/editor/.env`, then delete `ui/`.

### Single docker file
Or run the Front-End and Back-End in a single Dockerfile.

_Note: the database must be on the same network as docker or docker must connect to the external database (and have access)_

1. Build the Docker image. The UI compiles the Auth0 settings in, so the build needs
   them, as build arguments or in `frontend/apps/editor/.env` (see
   `frontend/apps/editor/.env.template`), and fails if any is missing. The build reads
   `deploy/editor/Dockerfile.dockerignore`, which needs BuildKit (Docker's default
   builder since Engine 23).
   ```shell
   docker build -f deploy/editor/Dockerfile -t ord \
   --build-arg VITE_AUTH0_DOMAIN="..." \
   --build-arg VITE_AUTH0_CLIENT_ID="..." \
   --build-arg VITE_AUTH0_AUDIENCE="..." \
   --build-arg VITE_AUTH0_ISSUER="..." \
   --build-arg VITE_AUTH0_SCOPE="openid profile email offline_access" \
   .
   ```
2. Run the Docker image. The backend reads its Auth0 settings and the key that signs
   download links at run time.
   ```shell
   docker run \
   --network ord_network \
   -e DOWNLOAD_LINK_SECRET="$(openssl rand -base64 32)" \
   -e VITE_AUTH0_DOMAIN="..." \
   -e VITE_AUTH0_CLIENT_ID="..." \
   -e VITE_AUTH0_AUDIENCE="..." \
   -e VITE_AUTH0_ISSUER="..." \
   -e PG_DSN="postgresql+psycopg://ord@db:5432/ord" \
   --rm -p 5173:5173 ord
   ```

Envs for backend:

| Name                    | Description                                        | Required | Default                                                 |
|-------------------------|----------------------------------------------------|----------|---------------------------------------------------------|
| `pg_dsn`                | DSN for connecting to the database                 | false    | `postgresql+psycopg://ord@localhost:5400/ord`           |
| `cors_origins`          | Allowed origins                                    | false    | `["http://localhost:5173"]`                             |
| `app_env`               | Manages the application context (debug parameters) | false    | `production` (available: `localhost`, `production`)     |
| `vite_auth0_domain`     | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_algorithms` | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_audience`   | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_issuer`     | Auth0 config                                       | true     | -                                                       |
| `vite_auth0_client_id`  | Auth0 config                                       | true     | -                                                       |
| `download_link_secret`  | Key that signs download links; the same for every worker | unless `app_env` is `localhost` | -                                  |


## Testing

Python tests are written with `pytest`:

```shell
pytest -vv
```
