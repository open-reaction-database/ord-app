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
import classes from './componentPreview.module.scss';
import { ReactionComponentPreview } from 'common/components/ReactionPreview/ReactionComponentPreview.tsx';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';

export function ComponentPreview() {
  const { reactionId } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);
  const component: ReactionInputComponent = useSelector(selectReactionPartByPath(reactionId, pathComponents));
  const previewStates = useSelector(selectPreviewsByIdsWrapper([component.id]));
  return (
    <div className={classes.previewWrapper}>
      <ReactionComponentPreview previewState={previewStates[component.id]} />
    </div>
  );
}
