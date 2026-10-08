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

"""Tests for ord_app.service_api.services.structures."""

import pytest
from ord_schema.proto.reaction_pb2 import Compound, CompoundIdentifier
from rdkit import Chem

from ord_app.service_api.services.structures import (
    canonicalize_smiles,
    molblock_from_compound,
)

CXSMILES_WITH_AND_GROUP = "C[C@H](N)C(=O)O |&1:1|"


def _compound(identifier_type: int, value: str) -> Compound:
    compound = Compound()
    compound.identifiers.add(type=identifier_type, value=value)
    return compound


@pytest.mark.parametrize(
    "smiles,expected",
    [
        ("OCC", "CCO"),
        ("CCO", "CCO"),
        ("c1ccccc1", "c1ccccc1"),
    ],
)
def test_canonicalize_smiles_leaves_plain_smiles_plain(smiles: str, expected: str):
    """Input without extended features must not grow a |...| block."""
    assert canonicalize_smiles(smiles) == expected


def test_canonicalize_smiles_retains_enhanced_stereo():
    assert "&1:" in canonicalize_smiles(CXSMILES_WITH_AND_GROUP)


def test_canonicalize_smiles_retains_atom_labels():
    assert "$_R1" in canonicalize_smiles("CC(N)C(=O)O |$_R1;;;;;$|")


def test_canonicalize_smiles_is_idempotent():
    once = canonicalize_smiles(CXSMILES_WITH_AND_GROUP)
    assert canonicalize_smiles(once) == once


def test_canonicalize_smiles_rejects_garbage():
    with pytest.raises(ValueError, match="Could not parse SMILES"):
        canonicalize_smiles("not-a-molecule")


def test_molblock_from_cxsmiles_only_compound():
    """A CXSMILES-only compound renders instead of raising."""
    compound = _compound(
        CompoundIdentifier.CompoundIdentifierType.CXSMILES, CXSMILES_WITH_AND_GROUP
    )
    molblock = molblock_from_compound(compound)
    assert "V3000" in molblock
    assert "STERAC" in molblock
    assert Chem.MolFromMolBlock(molblock) is not None


def test_molblock_from_cxsmiles_preserves_stereo_group_round_trip():
    compound = _compound(
        CompoundIdentifier.CompoundIdentifierType.CXSMILES, CXSMILES_WITH_AND_GROUP
    )
    mol = Chem.MolFromMolBlock(molblock_from_compound(compound))
    assert "&1:" in Chem.MolToCXSmiles(mol)


def test_molblock_prefers_existing_molblock_identifier():
    """Delegation to ord_schema is unchanged when it can do the job."""
    source = Chem.MolToMolBlock(Chem.MolFromSmiles("CCO"))
    compound = _compound(CompoundIdentifier.CompoundIdentifierType.MOLBLOCK, source)
    assert molblock_from_compound(compound) == source


def test_molblock_from_smiles_compound():
    compound = _compound(CompoundIdentifier.CompoundIdentifierType.SMILES, "CCO")
    assert Chem.MolFromMolBlock(molblock_from_compound(compound)) is not None


def test_molblock_without_structural_identifier_raises():
    compound = _compound(CompoundIdentifier.CompoundIdentifierType.NAME, "ethanol")
    with pytest.raises(ValueError, match="no valid structural identifier"):
        molblock_from_compound(compound)


def test_molblock_with_unparseable_cxsmiles_raises():
    compound = _compound(
        CompoundIdentifier.CompoundIdentifierType.CXSMILES, "not-a-molecule"
    )
    with pytest.raises(ValueError, match="no valid structural identifier"):
        molblock_from_compound(compound)
