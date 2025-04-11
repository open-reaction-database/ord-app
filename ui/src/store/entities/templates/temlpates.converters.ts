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
import type { Variable } from './templates.types.ts';
import type { AppReaction } from '../reactions/reactions.types.ts';
import { getDeepReactionPart } from '../reactions/reactions.utils.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { WithIdName } from '../reactions/reactionEntity/reactionEntity.types.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';

type VariableMap = Record<string, Variable>;

const getVariableId = (variable: Variable) => variable.path.join('.');

const mapKeys = ['inputs', 'analyses', 'features', 'analysisData'];

type NamedEntity = WithIdName<unknown>;
type NamedEntityMap = Record<string, NamedEntity>;

const findEntityByName = (name: string, reactionPart: NamedEntityMap): NamedEntity =>
  Object.values(reactionPart).find(item => item.name === name)!;

const findEntityById = (id: string, reactionPart: NamedEntityMap): NamedEntity =>
  Object.values(reactionPart).find(item => item.id === id)!;

function replaceNameIdInVariablePath(
  variable: Variable,
  reaction: AppReaction,
  replaceWith: 'id' | 'name',
): ReactionPathComponents {
  let updatedPath: ReactionPathComponents = [];
  for (let index = 0; index < variable.path.length; index++) {
    const pathComponent = variable.path[index];
    updatedPath = updatedPath.concat([pathComponent]);
    if (mapKeys.includes(pathComponent as string)) {
      const nameId = variable.path[index + 1] as string;
      let reactionPart: Record<string, WithIdName<unknown>>;
      if (replaceWith === 'id') {
        reactionPart = getDeepReactionPart(reaction, updatedPath);
      } else {
        reactionPart = getDeepReactionPart(reaction, variable.path.slice(0, index + 1));
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
  }
  return updatedPath;
}

export function ordTemplateVariablesToReaction(variables: Array<Variable>, reaction: AppReaction): VariableMap {
  return variables.reduce((acc: VariableMap, variable) => {
    try {
      const updatedPath: ReactionPathComponents = replaceNameIdInVariablePath(variable, reaction, 'id');
      const appVariable: Variable = {
        ...variable,
        path: updatedPath,
      };
      return {
        ...acc,
        [getVariableId(appVariable)]: appVariable,
      };
    } catch (e) {
      console.info(e);
      showNotification({ variant: NotificationVariant.ERROR, message: `Variable ${variable.name} is invalid` });
      return acc;
    }
  }, {});
}

export function reactionTemplateVariablesToOrd(variables: VariableMap, reaction: AppReaction): Array<Variable> {
  return Object.values(variables).reduce((acc: Array<Variable>, variable) => {
    try {
      const updatedPath: ReactionPathComponents = replaceNameIdInVariablePath(variable, reaction, 'name');
      const ordVariable: Variable = {
        ...variable,
        path: updatedPath,
      };
      return acc.concat(ordVariable);
    } catch (e) {
      console.info(e);
      showNotification({ variant: NotificationVariant.ERROR, message: `Variable ${variable.name} is invalid` });
      return acc;
    }
  }, []);
}
