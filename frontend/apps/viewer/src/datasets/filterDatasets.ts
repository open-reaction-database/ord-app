/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { DatasetSummary } from '#api/types.ts';

/**
 * The datasets matching every word of the filter, as ord-interface's table matched them.
 *
 * A word matches a dataset when any of its fields, the reaction count included, holds it,
 * ignoring case. An empty filter returns the datasets as given.
 */
export function filterDatasets(
  datasets: ReadonlyArray<DatasetSummary>,
  filter: string,
): ReadonlyArray<DatasetSummary> {
  const words = filter
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word !== '');
  if (words.length === 0) {
    return datasets;
  }
  return datasets.filter(dataset => {
    const fields = [
      dataset.dataset_id,
      dataset.name,
      dataset.description,
      String(dataset.reactions),
    ].map(field => field.toLowerCase());
    return words.every(word => fields.some(field => field.includes(word)));
  });
}
