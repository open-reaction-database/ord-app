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
import type { ord } from 'ord-schema-protobufjs';
import { withId } from '../reactionEntity/reactionEntity.converters';
import type { ReactionSetup } from './reactionSetup.types';
import {
  ordVesselTypeToReaction,
  reactionVesselTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters';

export const ordSetupToReactionSetup = (setup: ord.IReactionSetup | null | undefined): ReactionSetup => {
  const base = {
    id: '',
    vessel: ordVesselTypeToReaction(setup?.vessel?.type),
  };

  return withId(base);
};

export const reactionsetupToOrdSetup = (setup: ReactionSetup | undefined): ord.IReactionSetup => {
  return {
    vessel: setup?.vessel
      ? {
          type: reactionVesselTypeToOrd(setup.vessel),
        }
      : undefined,
  };
};
