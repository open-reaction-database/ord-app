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
import { useMemo } from 'react';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { useReactionPart } from '#reaction/provider/reactionProvider.hooks.ts';

export function buildUseInitialValues<Result extends object, Input extends Result>(
  filterInitialValues: (values: Input) => Result,
) {
  return function useInitialValues(
    pathComponents: ReactionPathComponents,
  ): [object, object, (values: object) => object] {
    // A drawer form opens only for an entity that exists.
    const { id: _, ...reactionPart } =
      useReactionPart<Record<string, unknown>>(pathComponents)!;

    const originalValue = useMemo(
      // The part at the form's path is the shape the form's sidebar info describes.
      (): Input => structuredClone(reactionPart) as Input,
      [reactionPart],
    );

    const valueWithoutNestedFields = useMemo(
      (): Result => structuredClone(filterInitialValues(originalValue)),
      [originalValue],
    );

    return [
      valueWithoutNestedFields,
      originalValue,
      filterInitialValues as unknown as (values: object) => object,
    ];
  };
}
