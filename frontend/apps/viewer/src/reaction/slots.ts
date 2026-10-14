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
import {
  DatasetReactionValueLabel,
  ReactionViewButton,
  type ReactionSlots,
} from '@open-reaction-database/ui/reaction';
import { ReactionLink } from '#reaction/ReactionLink.tsx';

/** The view's slots: read-only, each reaction ID a link to its page, and no drawing. */
export const VIEWER_SLOTS: ReactionSlots = {
  ViewDeleteButtons: ReactionViewButton,
  ValueLabel: DatasetReactionValueLabel,
  ViewOnlyLabel: DatasetReactionValueLabel,
  ReactionLink,
};
