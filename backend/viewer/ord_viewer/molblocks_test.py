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

"""Molblocks for a reaction's compounds."""

from ord_schema.proto import reaction_pb2

from ord_viewer.molblocks import reaction_molblocks, smiles_molblock


def test_every_slot_of_a_reaction():
    reaction = reaction_pb2.Reaction()
    reaction.inputs["solvent"].components.add().identifiers.add(
        type="SMILES", value="CCO"
    )
    product = reaction.outcomes.add().products.add()
    product.identifiers.add(type="SMILES", value="CC=O")
    standard = product.measurements.add(type="YIELD").authentic_standard
    standard.identifiers.add(type="SMILES", value="CC=O")
    workup = reaction.workups.add(type="ADDITION")
    workup.input.components.add().identifiers.add(type="NAME", value="brine")

    molblocks = reaction_molblocks(reaction)

    product_molblocks = molblocks.outcomes[0].products[0]
    standard_molblock = product_molblocks.measurements[0].authentic_standard.molblock
    assert "M  END" in (molblocks.inputs["solvent"][0] or "")
    assert "M  END" in (product_molblocks.molblock or "")
    assert "M  END" in (standard_molblock or "")
    assert molblocks.workups == [[None]]  # a name alone has no structure


def test_a_measurement_without_a_standard_has_no_molblock():
    reaction = reaction_pb2.Reaction()
    product = reaction.outcomes.add().products.add()
    product.identifiers.add(type="SMILES", value="C")
    product.measurements.add(type="YIELD")
    molblocks = reaction_molblocks(reaction)
    standard = molblocks.outcomes[0].products[0].measurements[0].authentic_standard
    assert standard.molblock is None


def test_unreadable_smiles_has_no_molblock():
    assert smiles_molblock("not a molecule") is None
