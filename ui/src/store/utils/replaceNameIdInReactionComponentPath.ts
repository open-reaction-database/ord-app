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
import type { AppReaction } from '../entities/reactions/reactions.types.ts';
import type { ReactionPathComponents } from '../../common/types/reaction/reactionPathComponents.ts';
import type { WithIdName } from '../entities/reactions/reactionEntity/reactionEntity.types.ts';
import { getDeepReactionPart } from '../entities/reactions/reactions.utils.ts';

const mapKeys = ['inputs', 'analyses', 'features', 'analysisData', 'automationCode'];

const conditionsWithMeasurements = ['temperature', 'electrochemistry', 'pressure'];

type NamedEntity = WithIdName<unknown>;
type NamedEntityMap = Record<string, NamedEntity>;

const findEntityByName = (name: string, reactionPart: NamedEntityMap): NamedEntity =>
  Object.values(reactionPart).find(item => item.name === name)!;

const findEntityById = (id: string, reactionPart: NamedEntityMap): NamedEntity =>
  Object.values(reactionPart).find(item => item.id === id)!;

export function replaceNameIdInReactionComponentPath(
  path: ReactionPathComponents,
  reaction: AppReaction,
  replaceWith: 'id' | 'name',
): ReactionPathComponents {
  let updatedPath: ReactionPathComponents = [];
  for (let index = 0; index < path.length; index++) {
    const pathComponent = path[index];
    updatedPath = updatedPath.concat([pathComponent]);
    if (mapKeys.includes(pathComponent as string)) {
      const nameId = path[index + 1] as string;
      let reactionPart: Record<string, WithIdName<unknown>>;
      if (replaceWith === 'id') {
        reactionPart = getDeepReactionPart(reaction, updatedPath);
      } else {
        reactionPart = getDeepReactionPart(reaction, path.slice(0, index + 1));
      }
      if (replaceWith === 'id') {
        const entity = findEntityByName(nameId, reactionPart);
        updatedPath = updatedPath.concat([entity.id]);
      } else {
        const entity = findEntityById(nameId, reactionPart);
        updatedPath = updatedPath.concat([entity.name]);
      }
      index++;
    }
    // TODO move somewhere or rewrite - quite fix necessary because of fields renaming
    const currentValue = updatedPath[index];
    if (
      index > 0 &&
      conditionsWithMeasurements.includes(updatedPath[index - 1] as string) &&
      typeof currentValue === 'string'
    ) {
      if (currentValue === 'measurements') {
        updatedPath[index] = `${updatedPath[index - 1]}Measurements`;
      } else if (currentValue.endsWith('Measurements')) {
        updatedPath[index] = 'measurements';
      }
    }
  }
  return updatedPath;
}
