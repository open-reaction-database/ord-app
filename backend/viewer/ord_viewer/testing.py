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
import tempfile
import types
from collections.abc import Callable, Mapping, Sequence
from datetime import datetime
from typing import Any, cast

import anthropic
import pyarrow as pa
from anthropic.types import TextBlock, ToolUseBlock
from anyio.from_thread import BlockingPortal
from fastapi import FastAPI
from fastapi.testclient import TestClient
from ord_schema import parquet
from ord_schema.artifacts import history
from ord_schema.artifacts.scripts import (
    derive_arrivals,
    derive_occurrences,
    derive_pivots,
    derive_projection,
    derive_structures,
)
from ord_schema.proto import dataset_pb2, reaction_pb2
from ord_schema.search import placeholders

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


# The commits reactions first reached ord-data in, oldest first, with their times.
COMMITS = (
    ("1" * 40, datetime(2021, 7, 28, 14, 7, 53)),
    ("2" * 40, datetime(2023, 3, 2, 9, 30)),
    ("3" * 40, datetime(2024, 1, 15, 11, 0)),
)

# The commit, in COMMITS, each dataset's reactions first reached ord-data in. The second
# dataset arrived later, so a query on first_commit tells them apart.
ARRIVALS = {"ord_dataset-viewer01": 0, "ord_dataset-viewer02": 1}

# Reactions added to their dataset in a later commit than the rest of it: one added to
# viewer one after viewer two arrived.
LATER_ARRIVALS = {"ord-viewer0103": 2}


def _first_commit(dataset_id: str, reaction_id: str) -> tuple[str, datetime]:
    """Return the commit a reaction first reached ord-data in, and its time.

    Args:
        dataset_id: The reaction's dataset.
        reaction_id: The reaction.

    Returns:
        The commit's SHA and time.
    """
    return COMMITS[LATER_ARRIVALS.get(reaction_id, ARRIVALS[dataset_id])]


def _write_arrivals_index(path: pathlib.Path) -> None:
    """Write an index of first commits placing each reaction at its _first_commit.

    Args:
        path: Where to write the index.
    """
    rows = []
    for dataset in DATASETS:
        for reaction in dataset.reactions:
            sha, timestamp = _first_commit(dataset.dataset_id, reaction.reaction_id)
            rows.append(
                {
                    "reaction_id": reaction.reaction_id,
                    "sha": sha,
                    "timestamp": timestamp,
                    "utc_offset_minutes": 0,
                    "dataset_id": dataset.dataset_id,
                }
            )
    table = pa.Table.from_pylist(rows, schema=history.INDEX_SCHEMA)
    history.write_index(history.Index(table, [sha for sha, _ in COMMITS]), path)


def derive_corpus(root: pathlib.Path) -> None:
    """Write DATASETS as sources under root and derive every artifact to read.

    Args:
        root: The directory to build the corpus in.
    """
    for index, dataset in enumerate(DATASETS):
        # A source that records no dataset ID is named by its place, since ".parquet"
        # would be hidden from the corpus's globs.
        name = dataset.dataset_id or f"unnamed{index}"
        source = root / "sources" / "aa" / f"{name}.parquet"
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
    with tempfile.TemporaryDirectory() as scratch:
        index = pathlib.Path(scratch) / "arrivals_index.parquet"
        _write_arrivals_index(index)
        derive_arrivals.main(
            derive_arrivals.parse_args(
                [
                    f"--input_pattern={pattern_root}/projections/*/*.parquet",
                    f"--output_dir={root}/arrivals",
                    f"--index={index}",
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
    corpus_dir: pathlib.Path,
    *,
    resolver: Callable[[str], str] | None = offline_resolver,
    ask_client: Any = None,
    **settings: Any,
) -> TestClient:
    """Return an unentered client over corpus_dir, with any settings overridden.

    Args:
        corpus_dir: The corpus the app serves.
        resolver: Resolves compound names in queries; None keeps the app's default,
            ord-schema's resolvers.
        ask_client: What /api/ask calls messages.create on: an anthropic.Anthropic, or a
            stub that scripts its responses. None answers 503, as with no key.
        **settings: Settings fields to set beyond corpus_dir.

    Returns:
        A client whose app opens the corpus when the client is entered.
    """
    app = create_app(
        lambda: Settings(corpus_dir=corpus_dir, **settings),
        resolver=resolver,
        ask_client_factory=lambda: ask_client,
    )
    return TestClient(app)


# A response the model's safety classifiers stopped.
DECLINED = "declined"


def _message(payload: Any) -> types.SimpleNamespace:
    """Build a Messages API response from a scripted payload.

    Args:
        payload: A dict holding "reason" for a cannot_answer call, any other dict for a
            build_query call, DECLINED for a classifier's stop, or another string for
            the answer's prose.

    Returns:
        A message with that content and nominal usage.
    """
    usage = types.SimpleNamespace(
        input_tokens=1,
        output_tokens=1,
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0,
    )
    if payload == DECLINED:
        details = types.SimpleNamespace(category="cyber")
        return types.SimpleNamespace(
            content=[], usage=usage, stop_reason="refusal", stop_details=details
        )
    if isinstance(payload, str):
        content: list[Any] = [TextBlock(type="text", text=payload)]
    else:
        tool = "cannot_answer" if "reason" in payload else "build_query"
        content = [
            ToolUseBlock(type="tool_use", id="toolu_stub", name=tool, input=payload)
        ]
    stop = "end_turn" if isinstance(payload, str) else "tool_use"
    return types.SimpleNamespace(content=content, usage=usage, stop_reason=stop)


class StubAskClient:
    """Answers messages.create from a script, in order: a query, prose, or a refusal.

    Args:
        *responses: One per call, in order, as _message reads them; an exception is
            raised instead.
    """

    def __init__(self, *responses: Any) -> None:
        self._responses = list(responses)
        self.requests: list[dict[str, Any]] = []
        self.messages = self
        self.closed = False

    def close(self) -> None:
        """Record that the app closed the client, as it does at shutdown."""
        self.closed = True

    def create(self, **kwargs: Any) -> types.SimpleNamespace:
        """Record the request and answer with the next scripted response.

        Args:
            **kwargs: The request nl.ask sends.

        Returns:
            The next scripted message.

        Raises:
            Exception: The next scripted response, when it is one.
        """
        self.requests.append(kwargs)
        payload = self._responses.pop(0)
        if isinstance(payload, Exception):
            raise payload
        return _message(payload)


class ScriptedAskClient:
    """Answers each question it has a script for, and cannot answer any other.

    nl.ask's query calls carry tools, and their first message is the question, followed
    by its placeholders' formats when it has any; its answer call carries none, and its
    one message starts "Question: <question>" before the result. Both send each
    message's content as a string.

    Args:
        scripts: For each question, the query it compiles to and the sentence that
            answers it.
    """

    def __init__(self, scripts: Mapping[str, tuple[dict[str, Any], str]]) -> None:
        self._scripts = scripts
        self.messages = self

    def close(self) -> None:
        """Nothing to release; the app closes its client at shutdown."""

    def create(self, **kwargs: Any) -> types.SimpleNamespace:
        """Answer the question in the request from its script.

        Args:
            **kwargs: The request nl.ask sends.

        Returns:
            The scripted query, the scripted sentence, or a cannot_answer call.
        """
        text = kwargs["messages"][0]["content"]
        if "tools" in kwargs:
            question = text.split(f"\n\n{placeholders.PLACEHOLDERS_HEADING}", 1)[0]
            script = self._scripts.get(question)
            if script is None:
                return _message({"reason": "the scripted client has no script for it"})
            return _message(script[0])
        question = text.removeprefix("Question: ").split("\n\nResult:", 1)[0]
        return _message(self._scripts[question][1])


# The questions the viewer's end-to-end tests ask, over the fixture corpus. Each query
# orders its rows, so a test can compare them as a list.
ASK_SCRIPTS: dict[str, tuple[dict[str, Any], str]] = {
    "reactions that use acetyl chloride": (
        {
            "where": {
                "op": "exists",
                "path": "inputs.components",
                "where": {
                    "op": "same_compound",
                    "path": "smiles",
                    "smiles": "CC(=O)Cl",
                },
            },
            "order_by": [{"key": "reaction_id"}],
        },
        "Three reactions use acetyl chloride.",
    ),
    "how many reactions are in each dataset": (
        {
            "aggregate": {
                "group_by": ["dataset_id"],
                "measures": [{"fn": "count", "name": "reactions"}],
            },
            "order_by": [{"key": "dataset_id"}],
        },
        "The first dataset holds three reactions, and the second two.",
    ),
    "reactions that use @A": (
        {
            "where": {
                "op": "exists",
                "path": "inputs.components",
                "where": {"op": "same_compound", "path": "smiles", "smiles": "@A"},
            },
            "order_by": [{"key": "reaction_id"}],
        },
        "Three reactions use the structure you drew.",
    ),
}

# The structures the end-to-end tests give the questions in ASK_SCRIPTS that name them.
ASK_STRUCTURES: dict[str, dict[str, str]] = {
    "reactions that use @A": {"@A": "CC(=O)Cl"},
}


def e2e_app() -> FastAPI:
    """Build the app the viewer's end-to-end tests run against.

    Reads ORD_VIEWER_CORPUS_DIR and the other settings from the environment, as the
    image does, resolves compound names from COMPOUND_NAMES without the network, and
    answers /api/ask from ASK_SCRIPTS.

    Returns:
        The app, for ``uvicorn --factory ord_viewer.testing:e2e_app``.
    """
    return create_app(
        resolver=offline_resolver,
        # The scripted client has what the app calls: messages.create, and close.
        ask_client_factory=lambda: cast(
            anthropic.Anthropic, ScriptedAskClient(ASK_SCRIPTS)
        ),
    )


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
