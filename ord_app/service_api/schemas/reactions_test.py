# Copyright 2026 Open Reaction Database Project Authors
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

"""Tests for ord_app.service_api.schemas.reactions."""

from ord_schema.proto.reaction_pb2 import CompoundIdentifier, Reaction

from ord_app.service_api.schemas.reactions import get_molblocks

CXSMILES = CompoundIdentifier.CompoundIdentifierType.CXSMILES
NAME = CompoundIdentifier.CompoundIdentifierType.NAME
CXSMILES_WITH_AND_GROUP = "C[C@H](N)C(=O)O |&1:1|"


def test_input_preview_for_cxsmiles_only_component():
    """Previews are driven off these molblocks, so None means a blank drawing."""
    reaction = Reaction()
    component = reaction.inputs["m1"].components.add()
    component.identifiers.add(type=CXSMILES, value=CXSMILES_WITH_AND_GROUP)

    molblock = get_molblocks(reaction)["inputs"]["m1"][0]

    assert molblock is not None
    assert "STERAC" in molblock


def test_product_preview_for_cxsmiles_only_component():
    reaction = Reaction()
    product = reaction.outcomes.add().products.add()
    product.identifiers.add(type=CXSMILES, value=CXSMILES_WITH_AND_GROUP)

    molblocks = get_molblocks(reaction)

    assert molblocks["outcomes"][0]["products"][0]["molblock"] is not None


def test_component_without_structure_still_yields_none():
    reaction = Reaction()
    component = reaction.inputs["m1"].components.add()
    component.identifiers.add(type=NAME, value="ethanol")

    assert get_molblocks(reaction)["inputs"]["m1"] == [None]
