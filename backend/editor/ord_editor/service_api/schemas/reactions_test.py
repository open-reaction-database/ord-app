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
"""Tests for ord_editor.service_api.schemas.reactions."""

from ord_schema.proto.reaction_pb2 import Reaction

from ord_editor.service_api.schemas.reactions import get_molblocks

RACEMIC_ALANINE = "C[C@H](N)C(=O)O |&1:1|"


def test_input_preview_for_cxsmiles_only_component():
    # Previews are drawn from these molblocks, so None is a blank drawing.
    reaction = Reaction()
    component = reaction.inputs["m1"].components.add()
    component.identifiers.add(type="CXSMILES", value=RACEMIC_ALANINE)
    molblock = get_molblocks(reaction)["inputs"]["m1"][0]
    assert molblock is not None
    assert "STERAC" in molblock


def test_product_preview_for_cxsmiles_only_component():
    reaction = Reaction()
    product = reaction.outcomes.add().products.add()
    product.identifiers.add(type="CXSMILES", value=RACEMIC_ALANINE)
    molblock = get_molblocks(reaction)["outcomes"][0]["products"][0]["molblock"]
    assert molblock is not None
    assert "STERAC" in molblock


def test_preview_draws_cxsmiles_over_a_plain_smiles_recorded_first():
    # The plain SMILES asserts one enantiomer where the CXSMILES records a racemate.
    reaction = Reaction()
    component = reaction.inputs["m1"].components.add()
    component.identifiers.add(type="SMILES", value="C[C@H](N)C(=O)O")
    component.identifiers.add(type="CXSMILES", value=RACEMIC_ALANINE)
    assert "STERAC" in get_molblocks(reaction)["inputs"]["m1"][0]


def test_component_without_structure_yields_none():
    reaction = Reaction()
    component = reaction.inputs["m1"].components.add()
    component.identifiers.add(type="NAME", value="ethanol")
    assert get_molblocks(reaction)["inputs"]["m1"] == [None]
