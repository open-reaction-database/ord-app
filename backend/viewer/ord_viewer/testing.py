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

"""A small corpus built and derived the way ord-schema derives a published one."""

import argparse
import contextlib
import glob
import pathlib
from collections.abc import Sequence
from typing import Any, cast

from anyio.from_thread import BlockingPortal
from fastapi import FastAPI
from fastapi.testclient import TestClient
from ord_schema import parquet
from ord_schema.artifacts.scripts import (
    derive_occurrences,
    derive_pivots,
    derive_projection,
    derive_structures,
)
from ord_schema.proto import dataset_pb2, reaction_pb2

from ord_viewer.main import create_app
from ord_viewer.settings import Settings
from ord_viewer.slots import SearchSlots

# Names offline_resolver knows; any other name raises, as ord-schema's resolvers do.
COMPOUND_NAMES = {"pyridine": "c1ccncc1"}


def offline_resolver(name: str) -> str:
    """Resolve a compound name from COMPOUND_NAMES without the network.

    Args:
        name: A compound name from a query.

    Returns:
        The SMILES for the name.

    Raises:
        ValueError: If the name is not in COMPOUND_NAMES.
    """
    try:
        return COMPOUND_NAMES[name]
    except KeyError:
        raise ValueError(f"Could not resolve name {name} to SMILES") from None


def _reaction(
    reaction_id: str,
    *,
    reactants: Sequence[str],
    product: str,
    yield_percent: float | None = None,
    catalyst_name: str | None = None,
    conversion_percent: float | None = None,
    doi: str | None = None,
) -> reaction_pb2.Reaction:
    """Build a reaction with an optional yield, catalyst, conversion, and DOI.

    Args:
        reaction_id: The ID the reaction gets, such as ``ord-viewer0101``.
        reactants: Reactant SMILES, one component each.
        product: SMILES of the one product.
        yield_percent: The product's percent yield, if any.
        catalyst_name: The name of a catalyst input, if any.
        conversion_percent: The outcome's percent conversion, if any.
        doi: The DOI of the reaction's publication, if any.

    Returns:
        The reaction.
    """
    reaction = reaction_pb2.Reaction(reaction_id=reaction_id)
    for smiles in reactants:
        component = reaction.inputs["reactants"].components.add(
            reaction_role=reaction_pb2.ReactionRole.REACTANT
        )
        component.identifiers.add(type="SMILES", value=smiles)
    if catalyst_name is not None:
        catalyst = reaction.inputs["catalysts"].components.add(
            reaction_role=reaction_pb2.ReactionRole.CATALYST
        )
        catalyst.identifiers.add(type="NAME", value=catalyst_name)
    if doi is not None:
        reaction.provenance.doi = doi
    outcome = reaction.outcomes.add()
    if conversion_percent is not None:
        outcome.conversion.value = conversion_percent
    outcome_product = outcome.products.add()
    outcome_product.identifiers.add(type="SMILES", value=product)
    if yield_percent is not None:
        measurement = outcome_product.measurements.add(type="YIELD")
        measurement.percentage.value = yield_percent
    return reaction


DATASETS = (
    dataset_pb2.Dataset(
        dataset_id="ord_dataset-viewer01",
        name="viewer one",
        description="A Suzuki coupling and two acylations",
        reactions=[
            _reaction(
                "ord-viewer0101",
                reactants=["OB(O)c1ccccc1", "Brc1ccncc1"],
                product="c1ccc(-c2ccncc2)cc1",
                yield_percent=65,
            ),
            _reaction(
                "ord-viewer0102",
                reactants=["C[C@@H](N)C(=O)O", "CC(=O)Cl"],
                product="C[C@@H](NC(C)=O)C(=O)O",
                yield_percent=90,
            ),
            _reaction(
                "ord-viewer0103",
                reactants=["CCN", "CC(=O)Cl"],
                product="CCNC(C)=O",
                yield_percent=75,
            ),
        ],
    ),
    dataset_pb2.Dataset(
        dataset_id="ord_dataset-viewer02",
        name="viewer two",
        description="A mirror-image acylation and a named catalyst",
        reactions=[
            _reaction(
                "ord-viewer0201",
                reactants=["C[C@H](N)C(=O)O", "CC(=O)Cl"],
                product="C[C@H](NC(C)=O)C(=O)O",
                yield_percent=40,
            ),
            _reaction(
                "ord-viewer0202",
                reactants=["CCO", "CC(=O)O"],
                product="CCOC(C)=O",
                catalyst_name="mystery catalyst",
                conversion_percent=30,
                doi="10.1021/viewer0202",
            ),
        ],
    ),
)


def derive_corpus(root: pathlib.Path) -> None:
    """Write DATASETS as sources under root and derive every artifact to read.

    Args:
        root: The directory to build the corpus in.
    """
    for dataset in DATASETS:
        source = root / "sources" / "aa" / f"{dataset.dataset_id}.parquet"
        source.parent.mkdir(parents=True, exist_ok=True)
        parquet.save_dataset(dataset, source)
    # The input patterns are globs, so a metacharacter in root's own name is escaped.
    pattern_root = glob.escape(str(root))
    derive_projection.main(
        derive_projection.parse_args(
            [
                f"--input_pattern={pattern_root}/sources/*/*.parquet",
                f"--output_dir={root}/projections",
            ]
        )
    )
    derive_structures.main(
        derive_structures.parse_args(
            [
                f"--input_pattern={pattern_root}/projections/*/*.parquet",
                f"--output_dir={root}/structures",
            ]
        )
    )
    derive_pivots.main(
        derive_pivots.parse_args(
            [
                f"--input_pattern={pattern_root}/projections/*/*.parquet",
                f"--output_dir={root}/pivots",
            ]
        )
    )
    derive_occurrences.main(
        derive_occurrences.parse_args(
            [f"--pivots_dir={root}/pivots", f"--output_dir={root}/occurrences"]
        )
    )


def portal(client: TestClient) -> BlockingPortal:
    """Return the blocking portal to the event loop an entered client's app runs on.

    Args:
        client: A client inside its with statement.

    Returns:
        The portal, for running coroutines on the app's event loop from the test thread.

    Raises:
        RuntimeError: If the client has not been entered.
    """
    if client.portal is None:
        raise RuntimeError("enter the client before reaching its event loop")
    return client.portal


def _search_slots(client: TestClient) -> SearchSlots:
    """Return the search slots an entered client's app holds.

    Args:
        client: A client inside its with statement.

    Returns:
        The app's search slots.
    """
    return cast(FastAPI, client.app).state.viewer.slots


def hold_slot(client: TestClient) -> contextlib.AbstractContextManager[None]:
    """Hold one of the app's search slots from the test thread.

    Args:
        client: A client inside its with statement.

    Returns:
        A context manager holding the slot, on the app's event loop, for its body.
    """
    return portal(client).wrap_async_context_manager(_search_slots(client).hold())


def slot_waiters(client: TestClient) -> int:
    """Count the requests waiting for one of the app's search slots.

    Args:
        client: A client inside its with statement.

    Returns:
        The number waiting, read on the app's event loop.
    """
    return portal(client).call(_search_slots(client).waiting)


def make_client(
    corpus_dir: pathlib.Path, *, ask_client: Any = None, **settings: Any
) -> TestClient:
    """Return an unentered client over corpus_dir, with any settings overridden.

    Args:
        corpus_dir: The corpus the app serves.
        ask_client: What /api/ask calls messages.create on: an anthropic.Anthropic, or a
            stub that scripts its responses. None answers 503, as with no key.
        **settings: Settings fields to set beyond corpus_dir.

    Returns:
        A client whose app opens the corpus when the client is entered.
    """
    app = create_app(
        lambda: Settings(corpus_dir=corpus_dir, **settings),
        resolver=offline_resolver,
        ask_client_factory=lambda: ask_client,
    )
    return TestClient(app)


def e2e_app() -> FastAPI:
    """Build the app the viewer's end-to-end tests run against.

    Reads ORD_VIEWER_CORPUS_DIR and the other settings from the environment, as the
    image does, and resolves compound names from COMPOUND_NAMES, without the network.
    It has no model client, so /api/ask answers 503.

    Returns:
        The app, for ``uvicorn --factory ord_viewer.testing:e2e_app``.
    """
    return create_app(resolver=offline_resolver, ask_client_factory=lambda: None)


def main(argv: Sequence[str] | None = None) -> None:
    """Derive the test corpus into a directory, for the image's smoke test.

    Args:
        argv: The command line's arguments, naming the directory; None reads sys.argv.
            The directory may be missing, and is created.

    Raises:
        ValueError: If the directory exists and holds anything.
    """
    parser = argparse.ArgumentParser(description="Derive the viewer's test corpus.")
    parser.add_argument("directory", type=pathlib.Path)
    root = parser.parse_args(argv).directory
    if root.exists() and any(root.iterdir()):
        raise ValueError(f"{root} is not empty")
    root.mkdir(parents=True, exist_ok=True)
    derive_corpus(root)


if __name__ == "__main__":
    main()
