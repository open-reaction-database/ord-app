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
from collections import OrderedDict
from functools import wraps


class LRUCacheDict:
    def __init__(self, maxsize=None):
        self.maxsize = maxsize
        self._data = OrderedDict()

    def get(self, key):
        if key in self._data:
            value = self._data.pop(key)
            self._data[key] = value
            return value
        return None

    def set(self, key, value):
        if key in self._data:
            self._data.pop(key)
            self._data[key] = value
        else:
            self._data[key] = value
            if self.maxsize and len(self._data) > self.maxsize:
                self._data.popitem(last=False)


def alru_cache(maxsize=None):
    def decorator(func):
        lock = asyncio.Lock()
        cache = LRUCacheDict(maxsize=maxsize)

        @wraps(func)
        async def wrapped(*args, **kwargs):
            key = (args, frozenset(kwargs.items()))
            cached = cache.get(key)
            if cached is not None:
                return cached

            async with lock:
                cached = cache.get(key)
                if cached is not None:
                    return cached

                result = await func(*args, **kwargs)
                cache.set(key, result)
                return result

        return wrapped
    return decorator
