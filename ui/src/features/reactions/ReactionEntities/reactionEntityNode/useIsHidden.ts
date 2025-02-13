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
import type {
  ReactionFormMethods,
  ReactionFormConditionalRendering,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useState } from 'react';

export const useIsHidden = (
  condition: ReactionFormConditionalRendering['condition'],
  formMethods: ReactionFormMethods,
) => {
  if (!condition) return false;
  const initialValue = condition ? condition.isHidden(formMethods.getValues()[condition.name]) : false;
  // condition will always stay the same in the runtime due to it being readonly property
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isHidden, setIsHidden] = useState(initialValue);
  formMethods.watch(condition.name, ({ value }) => {
    setIsHidden(condition.isHidden(value));
  });
  return isHidden;
};
