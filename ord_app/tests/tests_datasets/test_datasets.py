# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from ord_app.service_api.domain.datasets import create_dataset, get_user_dataset
from ord_app.service_api.schemas.datasets import DatasetCreateSchema


async def test_create_dataset(api_client, test_user, test_db_session):
    test_user, access_token = test_user

    payload = {"name": "test creation"}
    response = api_client.post(
        "/api/v1/datasets",
        headers={"Authorization": access_token},
        json=payload,
    )
    response.raise_for_status()
    response_data = response.json()

    db_dataset = await get_user_dataset(test_db_session, test_user, response_data["id"])

    assert response_data["id"] == db_dataset.id
    assert response_data["name"] == db_dataset.name == payload["name"]


async def test_list_datasets(api_client, test_user, test_db_session):
    test_user, access_token = test_user
    payload = DatasetCreateSchema(name="test")
    db_dataset = await create_dataset(test_db_session, test_user, payload)

    response = api_client.get("/api/v1/datasets", headers={"Authorization": access_token})
    response.raise_for_status()
    response_data = response.json()

    assert len(response_data) == 1
    assert response_data[0]["id"] == db_dataset.id
    assert response_data[0]["name"] == db_dataset.name


async def test_delete_dataset(api_client, test_user, test_db_session):
    test_user, access_token = test_user

    payload = DatasetCreateSchema(name="test")
    db_dataset = await create_dataset(test_db_session, test_user, payload)

    response = api_client.delete(f"/api/v1/datasets/{db_dataset.id}", headers={"Authorization": access_token})
    response.raise_for_status()

    db_dataset = await get_user_dataset(test_db_session, test_user, db_dataset.id)
    assert db_dataset is None


# def test_fetch_dataset(test_client):
#     response = test_client.get(
#         "/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen"}
#     )
#     response.raise_for_status()
#     dataset = Dataset.FromString(b64decode(response.json()))
#     assert len(dataset.reactions) == 80
#
#
# def test_fetch_unknown_dataset(test_client):
#     response = test_client.get("/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": "UNKNOWN"})
#     with pytest.raises(HTTPStatusError):
#         response.raise_for_status()
#     assert response.status_code == 404
#
#
# @pytest.mark.parametrize("kind", ("binpb", "json", "txtpb"))
# def test_download_dataset(test_client, kind):
#     response = test_client.get(
#         "/service_api/editor/download_dataset",
#         params={"user_id": TEST_USER_ID, "dataset_name": "Deoxyfluorination screen", "kind": kind},
#     )
#     response.raise_for_status()
#     dataset = load_message(gzip.decompress(response.read()), Dataset, kind=kind)
#     assert len(dataset.reactions) == 80
#
#
# @pytest.mark.parametrize("kind,compress", itertools.product(["binpb", "json", "txtpb"], [False, True]))
# def test_upload_dataset(test_client, kind, compress):
#     dataset_name = "test"
#     dataset = Dataset(name=dataset_name)
#     data = write_message(dataset, kind)
#     suffix = kind
#     if compress:
#         suffix = f"{kind}.gz"
#         data = gzip.compress(data)
#     response = test_client.post(
#         f"/service_api/editor/upload_dataset/{TEST_USER_ID}", files={"file": (f"test.{suffix}", BytesIO(data))}
#     )
#     response.raise_for_status()
#     response = test_client.get(
#         "/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
#     )
#     response.raise_for_status()
#
#

#
#
# def test_create_dataset_unknown_user(test_client):
#     response = test_client.get("/service_api/editor/create_dataset", params={"user_id": "test", "dataset_name": "test"})
#     with pytest.raises(HTTPStatusError):
#         response.raise_for_status()
#
#
# def test_delete_dataset(test_client):
#     dataset_name = "Deoxyfluorination screen"
#     response = test_client.get(
#         "/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
#     )
#     response.raise_for_status()
#     response = test_client.get(
#         "/service_api/editor/delete_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
#     )
#     response.raise_for_status()
#     response = test_client.get(
#         "/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
#     )
#     with pytest.raises(HTTPStatusError):
#         response.raise_for_status()
#     assert response.status_code == 404
#
#
# def test_enumerate_dataset(test_client):
#     root = os.path.join(os.path.dirname(__file__), "testdata", "enumeration")
#     template = os.path.join(root, "nielsen_fig1_template.txtpb")
#     spreadsheet = os.path.join(root, "nielsen_fig1.csv")
#     response = test_client.post(
#         f"/service_api/editor/enumerate_dataset/{TEST_USER_ID}",
#         files={"template": (template, open(template, "rb")), "spreadsheet": (spreadsheet, open(spreadsheet, "rb"))},
#     )
#     response.raise_for_status()
#     dataset_name = response.json()
#     assert dataset_name == "nielsen_fig1"
#     response = test_client.get(
#         "/service_api/editor/fetch_dataset", params={"user_id": TEST_USER_ID, "dataset_name": dataset_name}
#     )
#     response.raise_for_status()
#     dataset = Dataset.FromString(b64decode(response.json()))
#     assert len(dataset.reactions) == 80
