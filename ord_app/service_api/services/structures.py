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

"""Structure handling that understands CXSMILES.

``ord_schema`` recognizes SMILES, InChI, and MolBlock as structural identifiers.
CXSMILES carries features -- enhanced stereochemistry, atom labels, coordinates --
that plain SMILES cannot express, so it needs a parser that keeps those extensions
and a MolBlock writer that has somewhere to put them.
"""

from ord_schema.message_helpers import molblock_from_compound as _ord_molblock
from ord_schema.proto.reaction_pb2 import Compound, CompoundIdentifier, ProductCompound
from rdkit import Chem

CXSMILES = CompoundIdentifier.CompoundIdentifierType.CXSMILES


def canonicalize_smiles(smiles: str) -> str:
    """Canonicalizes a SMILES string, retaining any CXSMILES extensions.

    Args:
        smiles: SMILES or CXSMILES string.

    Returns:
        Canonicalized SMILES string. Extended features are appended in a ``|...|``
        block; input without such features round-trips as plain SMILES.

    Raises:
        ValueError: If the SMILES cannot be parsed by RDKit.
    """
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise ValueError(f"Could not parse SMILES: {smiles}")
    return Chem.MolToCXSmiles(mol)


def molblock_from_compound(compound: Compound | ProductCompound) -> str:
    """Fetches or generates a MolBlock for a compound.

    Args:
        compound: Compound or ProductCompound message.

    Returns:
        MolBlock identifier. Compounds whose only structural identifier is CXSMILES
        yield V3000, the format able to represent enhanced stereochemistry.

    Raises:
        ValueError: If no structural identifier can be interpreted.
    """
    try:
        return _ord_molblock(compound)
    except ValueError:
        for identifier in compound.identifiers:
            if identifier.type == CXSMILES:
                mol = Chem.MolFromSmiles(identifier.value)
                if mol is not None:
                    return Chem.MolToV3KMolBlock(mol)
        raise
