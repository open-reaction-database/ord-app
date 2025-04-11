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
import {
  type ReactionFormNode,
  ReactionFormNodeType,
} from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { wrapInputsWithGrid } from 'common/utils/reactionForm/wrapInputsWithGrid.ts';
import { amountTypeOptions, volumeUnitNames } from 'store/entities/reactions/reactionAmount/reactionAmount.models.ts';
import type { ReactionAmount } from 'store/entities/reactions/reactionAmount/reactionAmount.types.ts';
import { booleanOptions } from 'features/reactions/ReactionEntities/entityFormConfiguration/booleanOptions.ts';

export const reactionAmounts: Array<ReactionFormNode> = [
  wrapInputsWithGrid(
    {
      type: ReactionFormNodeType.vpu,
      name: 'amount',
      options: amountTypeOptions,
      wrapperConfig: {
        label: 'Amount',
      },
      select: 'native-inline',
    },
    {
      type: ReactionFormNodeType.select,
      name: 'amount.volumeIncludesSolutes',
      wrapperConfig: {
        label: 'Includes solutes',
      },
      condition: {
        name: 'amount',
        isHidden: (item: unknown) => !volumeUnitNames.includes((item as ReactionAmount).units),
      },
      options: booleanOptions,
      selectType: 'dropdown',
    },
  ),
];
