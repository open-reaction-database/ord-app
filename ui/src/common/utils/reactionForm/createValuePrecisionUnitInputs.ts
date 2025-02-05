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
import { type ReactionFormWrapper, ReactionFormNodeType } from '../../types/reaction/reactionFields';

interface ValuePrecisionUnitOptions {
  name: string;
  label: string;
  hint?: string;
  unitOptions: Array<{ label: string; value: string }>;
}

export const createValuePrecisionUnitInputs = ({
  name,
  label,
  unitOptions,
  hint,
}: ValuePrecisionUnitOptions): ReactionFormWrapper => ({
  type: ReactionFormNodeType.wrapper,
  grid: 2,
  wrapperConfig: {
    label,
    hint,
  },
  fields: [
    {
      type: ReactionFormNodeType.group,
      fields: [
        {
          type: ReactionFormNodeType.value,
          name: `${name}.value`,
          inputType: 'number',
          inputConfig: {
            placeholder: 'Value',
          },
        },
        {
          type: ReactionFormNodeType.value,
          name: `${name}.precision`,
          inputType: 'number',
          inputConfig: {
            leftSection: '±',
            placeholder: 'Precision',
          },
        },
      ],
    },
    {
      type: ReactionFormNodeType.select,
      name: `${name}.unit`,
      selectType: 'segmented',
      options: unitOptions,
    },
  ],
});
