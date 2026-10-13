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

"""Molblocks for the browser, which draws molecules with Indigo rather than SVG."""

from rdkit import Chem


def smiles_molblock(smiles: str) -> str | None:
    """Return a molblock for a SMILES, or None if RDKit cannot read it.

    Args:
        smiles: A SMILES string.

    Returns:
        The molblock, or None if RDKit cannot parse the SMILES.
    """
    molecule = Chem.MolFromSmiles(smiles)
    return None if molecule is None else Chem.MolToMolBlock(molecule)
