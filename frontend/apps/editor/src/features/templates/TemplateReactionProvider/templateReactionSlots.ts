/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import type { ReactionSlots } from 'features/reactions/provider/reactionProvider.types.ts';
import { DatasetReactionValueLabel } from 'features/reactions/ReactionInteractions/ReactionValueLabel/DatasetReactionValueLable.tsx';
import { TemplateReactionValueLabelWrapper } from 'features/reactions/ReactionInteractions/ReactionValueLabel/TemplateReactionValueLabel.tsx';
import { SearchReactionLink } from 'features/reactions/ReactionInteractions/SearchReactionLink/SearchReactionLink.tsx';
import { ReactionSetVariablesButton } from 'features/reactions/ReactionInteractions/ReactionViewDeleteButtons/ReactionSetVariablesButton.tsx';

/** The slots of a template, where a field's label can make it a variable. */
export const TEMPLATE_SLOTS: ReactionSlots = {
  ViewDeleteButtons: ReactionSetVariablesButton,
  ValueLabel: TemplateReactionValueLabelWrapper,
  ViewOnlyLabel: DatasetReactionValueLabel,
  ReactionLink: SearchReactionLink,
};
