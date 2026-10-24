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
import type { components, paths } from '#api/schema.ts';

type Schemas = components['schemas'];

export type DatasetSummary = Schemas['DatasetSummary'];
export type NewestDataset = Schemas['NewestDataset'];
export type CompoundCount = Schemas['CompoundCount'];
export type ReactionRecord = Schemas['ReactionRecord'];
/** A query as /api/search takes it. */
export type Query = Schemas['Query-Input'];
/** A query as /api/ask returns it: what the question compiled to. */
export type CompiledQuery = Schemas['Query-Output'];
export type ReactionsResult = Schemas['ReactionsResult'];
export type TableResult = Schemas['TableResult'];
export type SearchResult = ReactionsResult | TableResult;
export type AskResponse = Schemas['AskResponse'];
export type SearchRequest = Schemas['SearchRequest'];
export type AskRequest = Schemas['AskRequest'];
export type DownloadRequest = Schemas['DownloadRequest'];
export type CompoundSide = NonNullable<
  NonNullable<
    paths['/api/datasets/{dataset_id}/compounds']['get']['parameters']['query']
  >['side']
>;
