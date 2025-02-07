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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactionEntity } from './reactionEntityToForm.models';
import { ord } from 'ord-schema-protobufjs';

type ConversionOptions = Parameters<typeof ord.ReactionInput.toObject>[1];

interface ReactionEntityConstructor<T> {
  new (): T;
  toObject: (instance: T, options?: ConversionOptions) => { [k: string]: any };
}

export const reactionEntityToConstructor: Record<ReactionEntity, ReactionEntityConstructor<any>> = {
  [ReactionEntity.Inputs]: ord.ReactionInput,
  [ReactionEntity.Notes]: ord.ReactionNotes,
  [ReactionEntity.Identifiers]: ord.ReactionIdentifier,
};
