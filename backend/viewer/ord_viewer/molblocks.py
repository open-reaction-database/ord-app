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

"""Molblocks for the browser, which draws each structure itself with Indigo."""

from ord_schema import message_helpers
from ord_schema.proto import reaction_pb2
from rdkit import Chem

from ord_viewer.schemas import (
    AuthenticStandardMolblock,
    MeasurementMolblocks,
    OutcomeMolblocks,
    ProductMolblocks,
    ReactionMolblocks,
)


def smiles_molblock(smiles: str) -> str | None:
    """Return a molblock for a SMILES, or None if RDKit cannot read it.

    Args:
        smiles: A SMILES string.

    Returns:
        The molblock, or None if RDKit cannot parse the SMILES.
    """
    molecule = Chem.MolFromSmiles(smiles)
    return None if molecule is None else Chem.MolToMolBlock(molecule)


def _compound_molblock(
    compound: reaction_pb2.Compound | reaction_pb2.ProductCompound,
) -> str | None:
    """Return a compound's molblock, or None if no identifier is a structure.

    Args:
        compound: A reaction input, workup, product, or standard compound.

    Returns:
        The molblock, or None if none of the compound's identifiers reads.
    """
    try:
        return message_helpers.molblock_from_compound(compound)
    except ValueError:
        return None


def reaction_molblocks(reaction: reaction_pb2.Reaction) -> ReactionMolblocks:
    """Return a molblock for each input, product, standard, and workup compound.

    Args:
        reaction: The reaction to draw.

    Returns:
        The molblocks, in the shape the editor's previews read.
    """
    return ReactionMolblocks(
        inputs={
            key: [
                _compound_molblock(component) for component in reaction_input.components
            ]
            for key, reaction_input in reaction.inputs.items()
        },
        outcomes=[
            OutcomeMolblocks(
                products=[
                    ProductMolblocks(
                        molblock=_compound_molblock(product),
                        measurements=[
                            MeasurementMolblocks(
                                authentic_standard=AuthenticStandardMolblock(
                                    molblock=_compound_molblock(
                                        measurement.authentic_standard
                                    )
                                )
                            )
                            for measurement in product.measurements
                        ],
                    )
                    for product in outcome.products
                ]
            )
            for outcome in reaction.outcomes
        ],
        workups=[
            [_compound_molblock(component) for component in workup.input.components]
            for workup in reaction.workups
        ],
    )
