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
import { useCallback } from 'react';
import {
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
  type ReactionPathComponents,
} from '@open-reaction-database/ui/reaction/model';
import { useReactionActions } from '@open-reaction-database/ui/reaction';

export interface UpdatePersonInfoProps extends ReactionFormCustomProps {
  text: string;
}

export function UpdatePersonInfo({
  name,
  formMethods,
  text,
}: Readonly<UpdatePersonInfoProps>) {
  const actions = useReactionActions();
  const { setValues } = formMethods;

  const updateFields = useCallback(() => {
    const person = actions?.currentPerson?.();
    if (!person) {
      return;
    }
    const pathComponents: ReactionPathComponents = name.split('.');
    setValues(prevValues =>
      deepMergeWithArrayMerge(
        prevValues,
        generateDeepPartialReactionByPath(pathComponents, person),
      ),
    );
  }, [actions, name, setValues]);

  // The button shows only on an editable reaction whose host can name the current person.
  return actions?.currentPerson ? <Button onClick={updateFields}>{text}</Button> : null;
}
