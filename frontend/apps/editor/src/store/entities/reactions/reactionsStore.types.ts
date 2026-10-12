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
import type {
  ReactionPathComponents,
  BaseReaction,
  DatasetReaction,
  ReactionId,
} from '@open-reaction-database/ui/reaction/model';
import type { Variable } from 'store/entities/templates/templates.types.ts';

export interface ReactionTemplate extends BaseReaction {
  id: string;
  name: string;
  variables: Record<string, Variable>;
  /** The variables the backend holds while edits are unsaved; restored if a save fails. */
  variablesBeforeEdit?: Record<string, Variable>;
  modified_at: string;
}

export type ReactionOrTemplate = DatasetReaction | ReactionTemplate;

// The server response never includes the client-only `dataBeforeEdit` snapshot. (#615)
export type UpdateReactionSuccessPayload = Omit<
  DatasetReaction,
  'data' | 'dataBeforeEdit'
>;

/** A saved edit: the server's fields, and the reaction data the save sent, which it now holds. */
export interface SavedReactionPayload extends UpdateReactionSuccessPayload {
  savedData: DatasetReaction['data'];
}

export interface ImportReactionFromFilePayload {
  file: File;
}

export interface RenameReactionPayload {
  reactionId: ReactionId;
  name: string;
}

/** A saved rename: the save's result, whose `savedData` the backend now holds under `name`. */
export interface RenamedReactionPayload
  extends SavedReactionPayload, RenameReactionPayload {}

export interface UpdateReactionPayload {
  reactionId: ReactionId;
  pathComponents: ReactionPathComponents;
}

export interface AddEditReactionFieldPayload extends UpdateReactionPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any;
}
