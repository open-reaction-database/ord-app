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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { replaceNameIdInReactionComponentPath } from '../../utils/replaceNameIdInReactionComponentPath.ts';

type VariableMap = Record<string, Variable>;

const getVariableId = (variable: Variable) => variable.path.join('.');

export function ordTemplateVariablesToReaction(variables: Array<Variable>, reaction: AppReaction): VariableMap {
  return variables.reduce((acc: VariableMap, variable) => {
    try {
      const updatedPath: ReactionPathComponents = replaceNameIdInReactionComponentPath(variable.path, reaction, 'id');
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
      const updatedPath: ReactionPathComponents = replaceNameIdInReactionComponentPath(variable.path, reaction, 'name');
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
