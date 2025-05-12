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
import type {
  AppReaction,
  DatasetReaction,
  ReactionMolBlocks,
  ReactionResponse,
  ReactionValidation,
} from './reactions.types.ts';
import type { PreviewsById } from './reactionsPreviews/reactionsPreviews.types.ts';
import type { ReactionInput } from './reactionsInputs/reactionInputs.types.ts';
import type { Pages } from 'common/types';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { convertReactionFloatsToDoubles, ordReactionToReaction } from './reactions.converters.ts';
import type { OrdOptional } from './reactionEntity/reactionEntity.types.ts';

type MergeArrayOptions = Parameters<Required<Options>['mergeArray']>[0];
const protobufClassRegExp = /<class '.+'> /g;

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

const nodeEntitiesNamesWithoutCollection = ['authenticStandard', 'notes', 'conditions', 'provenance', 'input', 'setup'];

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

export const getReactionPreviews = (reaction: AppReaction, molblocks: ReactionMolBlocks): PreviewsById => {
  const inputsArray = Object.values(reaction.inputs);
  const inputsPreviews: PreviewsById = Object.entries(molblocks.inputs).reduce(
    (acc: PreviewsById, [inputName, input]) => ({
      ...acc,
      ...input.reduce((acc: PreviewsById, item, index) => {
        const component = (inputsArray.find(item => item.name === inputName) as ReactionInput).components[index];
        return {
          ...acc,
          [component.id]: item,
        };
      }, {}),
    }),
    {},
  );

  const outcomesPreviews: PreviewsById = molblocks.outcomes.reduce(
    (acc: PreviewsById, { products }, outcomeIndex) => ({
      ...acc,
      ...products.reduce((acc: PreviewsById, item, productIndex) => {
        const product = reaction.outcomes[outcomeIndex].products[productIndex];
        return {
          ...acc,
          [product.id]: item.molblock,
          ...item.measurements.reduce((acc: PreviewsById, measurementMolblock, index) => {
            const measurement = product.measurements[index];
            return measurement.authenticStandard
              ? {
                  ...acc,
                  [measurement.authenticStandard.id]: measurementMolblock.authentic_standard.molblock,
                }
              : acc;
          }, {}),
        };
      }, {}),
    }),
    {},
  );

  const workupsPreviews = molblocks.workups.reduce((acc: PreviewsById, item, workupIndex) => {
    const components = reaction.workups[workupIndex].input?.components;

    if (!components) {
      return acc;
    }

    return {
      ...acc,
      ...item.reduce((acc: PreviewsById, componentMolblock, componentIndex) => {
        const component = components[componentIndex];
        return {
          ...acc,
          [component.id]: componentMolblock,
        };
      }, {}),
    };
  }, {});

  return { ...inputsPreviews, ...outcomesPreviews, ...workupsPreviews };
};

export const parseValidation = (validation: ReactionValidation): ReactionValidation => {
  return {
    errors: validation.errors.map(item => item.replace(protobufClassRegExp, '')),
    warnings: validation.warnings.map(item => item.replace(protobufClassRegExp, '')),
  };
};

export const parseReaction = ({ binpb, molblocks, validation, ...rest }: ReactionResponse): DatasetReaction => {
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(binpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  convertReactionFloatsToDoubles(appReaction);
  const previews = getReactionPreviews(appReaction, molblocks);
  const updatedValidation = validation ? parseValidation(validation) : null;

  return {
    ...rest,
    previews,
    data: appReaction,
    validation: updatedValidation,
  };
};

export const parseReactionList = (pages: Pages<ReactionResponse>): Pages<DatasetReaction> => {
  const { items, ...pagination } = pages;
  const wrappedItems = items.map(parseReaction);
  return { ...pagination, items: wrappedItems };
};

const ENUM_UNSPECIFIED_VALUE = 0;

type ObjectValue = OrdOptional<number | string | Array<unknown> | boolean | object>;

export function convertObjectToNullIfEmpty<T extends Record<string, ObjectValue>>(
  object: T,
  enumKeys: Array<keyof T> = [],
): T | null {
  const isEmpty = Object.keys(object).every(key => {
    const value = object[key];
    if (enumKeys.includes(key) && value === ENUM_UNSPECIFIED_VALUE) {
      return true;
    }
    return value === undefined || value === null || value === '';
  });
  return isEmpty ? null : object;
}
