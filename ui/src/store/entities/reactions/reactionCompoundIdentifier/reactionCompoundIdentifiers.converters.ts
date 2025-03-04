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
import { ord } from 'ord-schema-protobufjs';
import type { ReactionCompoundIdentifier } from './reactionCompoundIdentifiers.types.ts';
import { compoundIdentifiersByValue } from './reactionCompoundIdentifiers.models.ts';

export const ordCompoundIdentifierToReaction = (
  compoundIdentifier: ord.ICompoundIdentifier,
): ReactionCompoundIdentifier => {
  const { type, ...rest } = compoundIdentifier;
  return {
    type: compoundIdentifiersByValue[type ?? 0],
    ...rest,
  };
};

export const reactionCompoundIdentifierToOrd = (
  compoundIdentifier: ReactionCompoundIdentifier,
): ord.ICompoundIdentifier => {
  const { type, ...rest } = compoundIdentifier;
  return {
    type: ord.CompoundIdentifier.CompoundIdentifierType[type],
    ...rest,
  };
};
