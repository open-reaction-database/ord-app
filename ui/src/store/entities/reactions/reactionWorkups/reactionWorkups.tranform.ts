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
import type { ReactionWorkup } from './reactionWorkups.types.ts';
import { WorkupConstants } from './reactionWorkups.constants.ts';
import { clearDependantFields } from 'store/utils/clearDependantFields.ts';
import type { WorkupType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';

const createPredicate = (types: Array<WorkupType>) => (workup: ReactionWorkup) => types.includes(workup.type);

export const workupTransform = (workup: ReactionWorkup): ReactionWorkup => {
  return clearDependantFields<ReactionWorkup>(workup, [
    ['duration', createPredicate(WorkupConstants.durationCompatibleTypes)],
    ['amount', createPredicate(WorkupConstants.aliquotCompatibleTypes)],
    ['keepPhase', createPredicate(WorkupConstants.keepPhaseCompatibleTypes)],
    ['targetPh', createPredicate(WorkupConstants.targetPhCompatibleTypes)],
    ['input', createPredicate(WorkupConstants.inputCompatibleTypes)],
    ['temperature', createPredicate(WorkupConstants.temperatureCompatibleTypes)],
    ['stirring', createPredicate(WorkupConstants.stirringCompatibleTypes)],
  ]);
};
