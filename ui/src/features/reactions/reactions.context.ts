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
import { createContext, type FC } from 'react';
import type { ReactionViewDeleteButtonsProps } from './ReactionInteractions/ReactionViewDeleteButtons/reactionViewDeleteButtons.types.ts';
import type { ReactionsContext } from './reactions.types.ts';
import type { ReactionValueLabelProps } from './ReactionInteractions/ReactionValueLabel/reactionValueLabel.types.ts';

const viewDeleteButtonsDefaultValue = null as unknown as FC<ReactionViewDeleteButtonsProps>;
const valueLabelDefaultValue = null as unknown as FC<ReactionValueLabelProps>;

const defaultContextValue: ReactionsContext = {
  reactionId: 0,
  isTemplate: false,
  isViewOnly: false,
  ViewDeleteButtonsComponent: viewDeleteButtonsDefaultValue,
  ValueLabelComponent: valueLabelDefaultValue,
  ViewOnlyLabelComponent: valueLabelDefaultValue,
};

export const reactionContext = createContext<ReactionsContext>(defaultContextValue);
