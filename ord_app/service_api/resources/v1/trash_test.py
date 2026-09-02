# Copyright 2024 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
from base64 import b64encode

from fastapi import status
from ord_schema.proto.reaction_pb2 import Reaction
from sqlalchemy import func, select, update

from ord_app.conftest import create_test_dataset, create_test_reaction, fake
from ord_app.service_api.domain.reactions import validate_dataset_reactions
from ord_app.service_api.models import (
    DatasetModel,
    ReactionModel,
    UserGroupsMembershipModel,
    UserModel,
)
from ord_app.service_api.settings import RuntimeSettings


async def test_dataset_trash_restore_and_empty(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    dataset_id = dataset.id
    *_, group = mock_authenticated_user

    response = api_client.delete(f"/api/v1/datasets/{dataset.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == "Object successfully deleted"
    await test_db_session.refresh(dataset)
    assert dataset.deleted_at is not None

    assert (
        api_client.get(f"/api/v1/datasets/{dataset.id}").status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        api_client.patch(
            f"/api/v1/datasets/{dataset.id}", json={"name": "hidden"}
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        api_client.delete(f"/api/v1/datasets/{dataset.id}").status_code
        == status.HTTP_404_NOT_FOUND
    )

    trash = api_client.get(f"/api/v1/groups/{group.id}/trash").raise_for_status().json()
    assert trash["datasets"][0]["id"] == dataset.id
    assert trash["datasets"][0]["deleted_by"]["id"] == dataset.owner_id

    restore = api_client.post(
        f"/api/v1/groups/{group.id}/trash/restore",
        json={"kind": "dataset", "id": dataset.id},
    )
    assert restore.status_code == status.HTTP_204_NO_CONTENT
    api_client.get(f"/api/v1/datasets/{dataset.id}").raise_for_status()

    api_client.delete(f"/api/v1/datasets/{dataset.id}").raise_for_status()
    empty = api_client.post(f"/api/v1/groups/{group.id}/trash/empty")
    assert empty.status_code == status.HTTP_204_NO_CONTENT
    test_db_session.expire_all()
    assert await test_db_session.get(DatasetModel, dataset_id) is None


async def test_editor_can_trash_but_only_admin_can_manage_trash(
    api_client, mock_authenticated_user, test_db_session
):
    admin, set_user_auth, group = mock_authenticated_user
    editor_dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    viewer_dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    editor = UserModel(
        email=fake.email(), external_id=str(fake.uuid4()), auth0_id=str(fake.uuid4())
    )
    viewer = UserModel(
        email=fake.email(), external_id=str(fake.uuid4()), auth0_id=str(fake.uuid4())
    )
    test_db_session.add_all(
        [
            editor,
            viewer,
            UserGroupsMembershipModel(user=editor, group=group, role="editor"),
            UserGroupsMembershipModel(user=viewer, group=group, role="viewer"),
        ]
    )
    await test_db_session.commit()

    set_user_auth(editor)
    api_client.delete(f"/api/v1/datasets/{editor_dataset.id}").raise_for_status()
    assert (
        api_client.get(f"/api/v1/groups/{group.id}/trash").status_code
        == status.HTTP_403_FORBIDDEN
    )

    set_user_auth(viewer)
    assert (
        api_client.delete(f"/api/v1/datasets/{viewer_dataset.id}").status_code
        == status.HTTP_403_FORBIDDEN
    )

    set_user_auth(admin)
    trash = api_client.get(f"/api/v1/groups/{group.id}/trash").raise_for_status().json()
    assert [item["id"] for item in trash["datasets"]] == [editor_dataset.id]


async def test_reaction_trash_live_filters_and_restore_clash(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    *_, group = mock_authenticated_user
    old_reaction = await create_test_reaction(
        test_db_session,
        mock_authenticated_user,
        dataset,
        Reaction(reaction_id="reusable-id"),
    )

    response = api_client.delete(
        f"/api/v1/datasets/{dataset.id}/reactions/{old_reaction.id}"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert (
        api_client.get(
            f"/api/v1/datasets/{dataset.id}/reactions/{old_reaction.id}"
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
    dataset_response = (
        api_client.get(f"/api/v1/datasets/{dataset.id}").raise_for_status().json()
    )
    assert dataset_response["reactions_count"]["total"] == 0

    encoded = b64encode(
        Reaction(reaction_id="reusable-id").SerializeToString()
    ).decode()
    replacement = (
        api_client.post(
            f"/api/v1/datasets/{dataset.id}/reactions",
            json={"binpb": encoded},
        )
        .raise_for_status()
        .json()
    )
    assert replacement["pb_reaction_id"] == "reusable-id"

    trash = api_client.get(f"/api/v1/groups/{group.id}/trash").raise_for_status().json()
    assert [item["id"] for item in trash["reactions"]] == [old_reaction.id]
    restore = api_client.post(
        f"/api/v1/groups/{group.id}/trash/restore",
        json={"kind": "reaction", "id": old_reaction.id},
    )
    assert restore.status_code == status.HTTP_409_CONFLICT
    assert restore.json()["detail"] == "Reaction id already in use in this dataset"


async def test_trash_cap_and_sql_ttl_purge(
    api_client, mock_authenticated_user, test_db_session, monkeypatch
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    first = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )
    first_id = first.id
    second = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset
    )
    *_, group = mock_authenticated_user
    monkeypatch.setattr(RuntimeSettings, "trash_max_items", 1)

    api_client.delete(
        f"/api/v1/datasets/{dataset.id}/reactions/{first.id}"
    ).raise_for_status()
    assert (
        api_client.delete(
            f"/api/v1/datasets/{dataset.id}/reactions/{first.id}"
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
    full = api_client.delete(f"/api/v1/datasets/{dataset.id}/reactions/{second.id}")
    assert full.status_code == status.HTTP_409_CONFLICT
    assert full.json()["detail"] == "Trash is full"

    monkeypatch.setattr(RuntimeSettings, "trash_max_items", 0)
    monkeypatch.setattr(RuntimeSettings, "trash_ttl_days", 1)
    await test_db_session.execute(
        update(ReactionModel)
        .where(ReactionModel.id == first.id)
        .values(deleted_at=func.now() - func.make_interval(0, 0, 0, 2))
    )
    await test_db_session.commit()
    trash = api_client.get(f"/api/v1/groups/{group.id}/trash").raise_for_status().json()
    assert trash["reactions"] == []
    test_db_session.expire_all()
    assert await test_db_session.get(ReactionModel, first_id) is None


async def test_validation_and_share_skip_trash(
    api_client, mock_authenticated_user, test_db_session
):
    dataset = await create_test_dataset(test_db_session, mock_authenticated_user)
    reaction = await create_test_reaction(
        test_db_session, mock_authenticated_user, dataset, is_valid=None
    )
    *_, group = mock_authenticated_user
    api_client.delete(f"/api/v1/datasets/{dataset.id}").raise_for_status()

    await validate_dataset_reactions(test_db_session, dataset.id)
    assert (
        await test_db_session.scalar(
            select(ReactionModel.is_valid).where(ReactionModel.id == reaction.id)
        )
        is None
    )

    payload = {"secondary_group_id": group.id + 1000}
    assert (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/{dataset.id}/share", json=payload
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
    assert (
        api_client.post(
            f"/api/v1/groups/{group.id}/datasets/{dataset.id}/unshare",
            json=payload,
        ).status_code
        == status.HTTP_404_NOT_FOUND
    )
