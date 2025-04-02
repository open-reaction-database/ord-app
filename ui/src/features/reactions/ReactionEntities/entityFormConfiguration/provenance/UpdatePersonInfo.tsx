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
import { Button } from '@mantine/core';
import type { ReactionFormCustomProps } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useSelector } from 'react-redux';
import { selectSelf } from 'store/entities/users/users.selectors.ts';
import type { ord } from 'ord-schema-protobufjs';
import { useCallback } from 'react';
import type { User } from 'store/entities/users/users.types.ts';
import {
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
} from 'store/entities/reactions/reactions.utils.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

export interface UpdatePersonInfoProps extends ReactionFormCustomProps {
  text: string;
}

const keys: Array<[keyof ord.IPerson, keyof User]> = [
  ['name', 'name'],
  ['email', 'email'],
  ['orcid', 'orcid_id'],
];

export function UpdatePersonInfo({ name, formMethods, text }: Readonly<UpdatePersonInfoProps>) {
  const user = useSelector(selectSelf)!;
  const { setValues } = formMethods;

  const updateFields = useCallback(() => {
    const person: Partial<ord.IPerson> = keys.reduce((acc: Partial<ord.IPerson>, [personKey, userKey]) => {
      const value = user[userKey];
      return value ? { ...acc, [personKey]: value } : acc;
    }, {});
    const pathComponents: ReactionPathComponents = name.split('.');
    setValues(prevValues =>
      deepMergeWithArrayMerge(prevValues, generateDeepPartialReactionByPath(pathComponents, person)),
    );
  }, [user, name, setValues]);

  return <Button onClick={updateFields}>{text}</Button>;
}
