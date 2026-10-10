/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import type { ReactionInput } from './reactionInputs.types.ts';
import { create } from '@bufbuild/protobuf';
import { ReactionInputSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { ordInputToReaction } from 'store/entities/reactions/reactionsInputs/reactionsInputs.converters.ts';

export function createEmptyReactionInput(name: string): ReactionInput {
  return ordInputToReaction(create(ReactionInputSchema), name);
}
