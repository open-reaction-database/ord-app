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
import asyncio
from functools import lru_cache
from urllib.parse import quote

from httpx import AsyncClient
from ord_schema import resolvers

from ord_app.service_api.services.utils import alru_cache


async def _pubchem_resolve(value_type: str, value: str) -> tuple[str, str]:
    """Resolves compound identifiers to SMILES via the PubChem REST API."""
    async with AsyncClient(base_url="https://pubchem.ncbi.nlm.nih.gov") as client:
        response = await client.get(f"/rest/pug/compound/{value_type}/{quote(value)}/property/IsomericSMILES/txt")
        return "PubChem API", response.raise_for_status().text.strip()


async def _cactus_resolve(*args, value: str) -> tuple[str, str]:
    """Resolves compound identifiers to SMILES via the CACTUS API."""
    async with AsyncClient(base_url="https://cactus.nci.nih.gov") as client:
        response = await client.get(f"/chemical/structure/{quote(value)}/smiles")
        return "NCI/CADD Chemical Identifier Resolver", response.raise_for_status().text.strip()


async def _emolecules_resolve(*args, value: str) -> tuple[str, str]:
    """Resolves compound identifiers to SMILES via the eMolecules API."""
    async with AsyncClient(base_url="https://www.emolecules.com") as client:
        response = await client.get(f"lookup?q={quote(value)}")
        return "eMolecules Lookup Service", response.raise_for_status().text.split("\t")[0]


@alru_cache(maxsize=128)
async def name_resolve_cached(value_type: str, value: str) -> tuple[str, str] | None:
    tasks = []
    for resolver_func in (_pubchem_resolve, _cactus_resolve, _emolecules_resolve):
        tasks.append(
            asyncio.create_task(
                resolver_func(value_type, value=value)
            )
        )

    for completed_task in asyncio.as_completed(tasks):
        try:
            response = await completed_task
            for t in tasks:
                if not t.done():
                    t.cancel()
            return response
        except Exception:
            continue


@lru_cache(maxsize=128)
def canonicalize_smiles_cached(smiles: str) -> str:
    return resolvers.canonicalize_smiles(smiles)
