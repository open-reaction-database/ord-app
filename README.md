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

The service reads these environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `ORD_VIEWER_CORPUS_DIR` | required | The corpus root, holding `projections/`, `structures/`, `pivots/`, `occurrences/`, and `sources/`; with the two revisions below set, the writable directory the corpus is fetched into |
| `ORD_VIEWER_ARTIFACTS_REVISION` | unset | The [ord-artifacts](https://huggingface.co/datasets/open-reaction-database/ord-artifacts) commit to fetch the derived artifacts from at startup. Its build must carry the artifact schema version and RDKit the viewer pins, or the fetch fails. Set with `ORD_VIEWER_SOURCES_REVISION` |
| `ORD_VIEWER_SOURCES_REVISION` | unset | The [ord-data mirror](https://huggingface.co/datasets/open-reaction-database/ord-data) commit to fetch the artifacts' source datasets from at startup: the mirror of the ord-data commit the artifacts' commit message names, or the corpus refuses the sources at open. Set with `ORD_VIEWER_ARTIFACTS_REVISION` |
| `ORD_VIEWER_MEMORY_LIMIT` | DuckDB's default | DuckDB's `memory_limit`, such as `6500MiB` |
| `ORD_VIEWER_MAX_CONCURRENT` | 4 | The most searches, asks, and dataset charts' aggregates in flight at once; each search gets cores / this many RDKit threads |
| `ORD_VIEWER_SEARCH_TIMEOUT_SECONDS` | 30 | The bound on one search, including an ask's; a search past it answers 504 |
| `ORD_VIEWER_SLOT_WAIT_SECONDS` | 10 | How long a request waits for a free search slot before answering 503 |
| `ORD_VIEWER_ASK_MODEL` | ord-schema's `nl.DEFAULT_MODEL` | The model `/api/ask` translates questions with |
| `ORD_VIEWER_ASK_LOG` | `none` | Where `/api/ask` records each question: `none`, or `stdout` for one JSON line per question |
| `ORD_ANTHROPIC_API_KEY` | unset | The key `/api/ask` calls the model with, falling back to `ANTHROPIC_API_KEY`; without either, `/api/ask` answers 503 and the other routes work |

The service serves a corpus one of two ways. A local corpus is a directory laid out as above: ord-schema's derive scripts (`ord_schema.artifacts.scripts.derive_projection`, `derive_structures`, `derive_pivots`, and `derive_occurrences`) produce its trees from source Parquet, and `sources/` holds that Parquet. A fetched corpus is downloaded at startup, before the service accepts connections: the artifacts from ord-artifacts into `ord-artifacts/` and their sources from the ord-data mirror into `ord-data/`, both under `ORD_VIEWER_CORPUS_DIR`. A restart over the same directory downloads only what changed. For a local smoke run, `ord_viewer.testing.derive_corpus(path)` writes the five-reaction test corpus:

```shell
uv run python -c "import pathlib; from ord_viewer.testing import derive_corpus; derive_corpus(pathlib.Path('/tmp/corpus'))"
```

### Viewer

The viewer's frontend is a workspace in `frontend/`. Its dev server, on port 5174, sends `/api` to the viewer's backend on port 8001, or to `ORD_VIEWER_API` when set:

```shell
cd frontend && npm ci
npm run dev -w apps/viewer
```

`npm test -w apps/viewer -- --run` runs its unit tests, and `npm run build -w apps/viewer` builds it into `frontend/apps/viewer/dist/`.

Its end-to-end tests run Playwright against the production build, served by `vite preview` on port 4174, and a backend over the five-reaction test corpus whose compound names resolve offline and whose `/api/ask` answers the questions in `ord_viewer.testing.ASK_SCRIPTS` without a model. From the repository's root, start the backend and the viewer, then run the tests:

```shell
(cd backend/viewer && uv run python -m ord_viewer.testing /tmp/viewer-corpus)
(cd backend/viewer && ORD_VIEWER_CORPUS_DIR=/tmp/viewer-corpus uv run uvicorn --factory ord_viewer.testing:e2e_app --host 127.0.0.1 --port 8001) &
(cd frontend && npm run build -w apps/viewer && npm run preview -w apps/viewer -- --host 127.0.0.1) &
cd frontend && npx -w apps/viewer playwright install chromium && npm run test:e2e -w apps/viewer
```

The screenshot tests run only in CI, where their baselines were made.

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
cd backend/editor && docker compose up -d
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


### The viewer's image
The viewer's image serves its bundle and API behind nginx on port 8080, over a corpus mounted or fetched at run time. To build it and check it over the five-reaction test corpus:
```shell
docker build -f deploy/viewer/Dockerfile -t ord-viewer .
(cd backend/viewer && uv run python -m ord_viewer.testing /tmp/viewer-corpus)
docker run --rm -p 8080:8080 -v /tmp/viewer-corpus:/corpus:ro -e ORD_VIEWER_CORPUS_DIR=/corpus ord-viewer
deploy/viewer/smoke_test.sh http://127.0.0.1:8080 ord-viewer0101
```
Mount a full corpus instead to serve it, or fetch one into a writable directory in the container:
```shell
docker run --rm -p 8080:8080 -e ORD_VIEWER_CORPUS_DIR=/app/corpus -e ORD_VIEWER_ARTIFACTS_REVISION=<commit> -e ORD_VIEWER_SOURCES_REVISION=<commit> ord-viewer
```
The other `ORD_VIEWER_*` settings are listed under "Viewer backend" above.

## Testing

Python tests are written with `pytest`:

```shell
pytest -vv
```
