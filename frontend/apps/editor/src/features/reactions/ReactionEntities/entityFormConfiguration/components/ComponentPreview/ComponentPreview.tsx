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
import { useContext } from 'react';
import {
  usePreviews,
  useReactionPart,
  reactionEntityContext,
} from '@open-reaction-database/ui/reaction';
import type { ReactionInputComponent } from '@open-reaction-database/ui/reaction/model';

export function ComponentPreview() {
  const { pathComponents } = useContext(reactionEntityContext);
  // The preview renders inside an existing component's form.
  const component = useReactionPart<ReactionInputComponent>(pathComponents)!;
  const previewStates = usePreviews([component.id]);
  return (
    <div className={classes.previewWrapper}>
      <ReactionComponentPreview previewState={previewStates[component.id]} />
    </div>
  );
}
