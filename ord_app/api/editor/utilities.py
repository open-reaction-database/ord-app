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

"""Utility API endpoints."""

import os
from base64 import b64decode
from io import BytesIO

from fastapi import APIRouter, Request, Response, UploadFile
from ord_schema import resolvers
from ord_schema.message_helpers import create_message
from ord_schema.templating import generate_dataset, read_spreadsheet
from ord_schema.validations import ValidationOptions, validate_message
from pydantic import BaseModel

from ord_app.api import send_message
from ord_app.api.database import add_dataset, get_cursor

router = APIRouter(tags=["utilities"])


def adjust_error(error: str) -> str:
    """Strips the message name from errors to make them more readable."""
    fields = error.split(":")
    location = ".".join(fields[0].strip().split(".")[1:])
    message = ":".join(fields[1:])
    if location:
        return f"{location}: {message.strip()}"
    return message.strip()


@router.post("/validate/{message_type}")
async def validate(message_type: str, request: Request):
    """Validates a protocol buffer message."""
    message = create_message(message_type)
    message.ParseFromString(await request.body())
    if message == type(message)():  # Skip empty messages.
        return {"errors": [], "warnings": []}
    options = ValidationOptions(require_provenance=True)
    output = validate_message(message, raise_on_error=False, options=options)
    errors = list(map(adjust_error, output.errors))
    warnings = list(map(adjust_error, output.warnings))
    return {"errors": errors, "warnings": warnings}


@router.get("/resolve_input")
async def resolve_input(input_string: str):
    """Resolves an input string into a ReactionInput message."""
    try:
        return send_message(resolvers.resolve_input(input_string))
    except (ValueError, KeyError) as error:
        return Response(str(error), status_code=400)


class ResolveCompoundInputs(BaseModel):
    """Inputs for resolve_compound."""

    identifier_type: str
    identifier: str


@router.post("/resolve_compound")
async def resolve_compound(inputs: ResolveCompoundInputs):
    """Resolves a compound identifier into a SMILES string."""
    try:
        smiles, resolver = resolvers.name_resolve(inputs.identifier_type, inputs.identifier)
        return {"smiles": resolvers.canonicalize_smiles(smiles), "resolver": resolver}
    except ValueError as error:
        return Response(str(error), status_code=400)


@router.get("/canonicalize_smiles")
async def canonicalize_smiles(smiles: str):
    """Canonicalizes a SMILES string."""
    try:
        return resolvers.canonicalize_smiles(smiles)
    except ValueError as error:
        return Response(str(error), status_code=400)


@router.post("/enumerate_dataset/{user_id}")
async def enumerate_dataset(user_id: str, template: UploadFile, spreadsheet: UploadFile):
    """Creates a new dataset based on a template reaction and a spreadsheet."""
    try:
        basename, suffix = os.path.splitext(os.path.basename(spreadsheet.filename))
        dataframe = read_spreadsheet(BytesIO(await spreadsheet.read()), suffix=suffix)
        dataset = generate_dataset(
            name=basename,
            description="Enumerated by the ORD editor.",
            template_string=(await template.read()).decode(),
            df=dataframe,
            validate=False,
        )
        with get_cursor() as cursor:
            add_dataset(user_id, dataset, cursor)
        return basename
    except Exception as error:  # pylint: disable=broad-except
        return Response(str(error), status_code=400)
