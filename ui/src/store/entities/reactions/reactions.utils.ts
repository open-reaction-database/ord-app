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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { deepmerge as deepmergeFactory, type Options } from '@fastify/deepmerge';
import { allowedNodeEntityNames } from './reactions.models.ts';

type MergeArrayOptions = Parameters<Required<Options>['mergeArray']>[0];

function mergeArray({ isMergeableObject, deepmerge, clone }: MergeArrayOptions) {
  return function (target: Array<unknown>, source: Array<unknown>) {
    const targetClone = clone(target);
    source.forEach((item, index) => {
      if (item) {
        const isMergeable = isMergeableObject(targetClone[index]) && isMergeableObject(item);
        targetClone[index] = isMergeable ? deepmerge(targetClone[index], item) : item;
      }
    });
    return targetClone;
  };
}

export const deepMergeWithArrayMerge = deepmergeFactory({ mergeArray });

export function generateDeepPartialReactionByPath(pathComponents: ReactionPathComponents, value: any): any {
  if (pathComponents.length === 0) {
    return value;
  }
  const [currentPathComponent, ...rest] = pathComponents;
  if (typeof currentPathComponent === 'number') {
    const array = [];
    array[currentPathComponent] = generateDeepPartialReactionByPath(rest, value);
    return array;
  }
  const object: Record<string, unknown> = {};
  object[currentPathComponent] = generateDeepPartialReactionByPath(rest, value);
  return object;
}

function iterateReactionPart(
  reactionPart: any,
  pathComponents: ReactionPathComponents,
  callback: (object: any, pathComponent: ReactionPathComponents) => any,
): any {
  const [currentPathComponent, ...rest] = pathComponents;
  if (typeof currentPathComponent === 'number') {
    return reactionPart
      .slice(0, currentPathComponent)
      .concat(callback(reactionPart[currentPathComponent], rest))
      .concat(reactionPart.slice(currentPathComponent + 1));
  }
  return {
    ...reactionPart,
    [currentPathComponent]: callback(reactionPart[currentPathComponent], rest),
  };
}

export function removeDeepReactionPart(reactionPart: any, pathComponents: ReactionPathComponents): any {
  if (pathComponents.length === 1) {
    const [currentPathComponent] = pathComponents;
    if (typeof currentPathComponent === 'number') {
      return reactionPart.slice(0, currentPathComponent).concat(reactionPart.slice(currentPathComponent + 1));
    }

    const { [currentPathComponent]: _, ...value } = reactionPart;
    return value;
  } else {
    return iterateReactionPart(reactionPart, pathComponents, removeDeepReactionPart);
  }
}

export function getDeepReactionPart(reaction: any, pathComponents: ReactionPathComponents): any {
  try {
    // If the path is incorrect we will get an error
    return pathComponents.reduce((reactionPart: any, key) => {
      return reactionPart[key];
    }, reaction);
  } catch (_e) {
    return null;
  }
}

const nodeEntitiesNamesWithoutCollection = ['authenticStandard', 'notes', 'conditions', 'provenance'];

export function reactionFlatPathToSidebars(pathComponents: ReactionPathComponents): Array<ReactionPathComponents> {
  const result: Array<ReactionPathComponents> = [];
  for (let i = 0; i < pathComponents.length; i++) {
    const pathComponent = pathComponents[i];
    if (nodeEntitiesNamesWithoutCollection.includes(pathComponent as string)) {
      result.push(pathComponents.slice(0, i + 1));
      continue;
    }
    if (allowedNodeEntityNames.includes(pathComponent as string)) {
      result.push(pathComponents.slice(0, i + 2));
      i++;
    }
  }
  return result;
}
