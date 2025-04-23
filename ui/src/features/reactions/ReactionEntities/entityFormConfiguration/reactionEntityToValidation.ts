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
import { type ReactionId, ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import { yupResolver } from '@mantine/form';
import * as yup from 'yup';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { useMemo } from 'react';
import type { WithIdName } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

const defaultValidate = yupResolver(yup.object({}));

function useDefaultValidate() {
  return useMemo(() => {
    return defaultValidate;
  }, []);
}

function useUniqueNameSchema(names: Array<string>, entityName = 'Entity') {
  return useMemo(() => {
    const schema = yup.object({
      name: yup
        .string()
        .required()
        .test('unique-name', `${entityName} name should be unique`, value => !names.includes(value)),
    });
    return yupResolver(schema);
  }, [names, entityName]);
}

const createNamedEntityValidation = (entityName: string) =>
  function useNamedEntityValidation(reactionId: ReactionId, pathComponents: ReactionPathComponents) {
    const objectsPath = pathComponents.slice(0, pathComponents.length - 1);
    const itemId = pathComponents.at(-1) as string;

    const objects: Record<string, WithIdName<unknown>> = useSelector(selectReactionPartByPath(reactionId, objectsPath));

    const names = useMemo(() => {
      return Object.values(objects).reduce((acc: Array<string>, input) => {
        if (input.id === itemId) {
          return acc;
        }
        return acc.concat(input.name);
      }, []);
    }, [objects, itemId]);

    return useUniqueNameSchema(names, entityName);
  };

export const reactionEntityToValidation: Record<
  string,
  (reactionId: ReactionId, pathComponents: ReactionPathComponents) => ReturnType<typeof yupResolver>
> = {
  [ReactionNodeEntity.Inputs]: createNamedEntityValidation('Input'),
  [ReactionNodeEntity.Features]: createNamedEntityValidation('Data'),
  [ReactionNodeEntity.Analyses]: createNamedEntityValidation('Analysis'),
};

export function useReactionEntityValidation(
  reactionId: ReactionId,
  pathComponents: ReactionPathComponents,
  nodeEntity: ReactionNodeEntity,
) {
  const useSchema = reactionEntityToValidation[nodeEntity] ?? useDefaultValidate;
  return useSchema(reactionId, pathComponents);
}
