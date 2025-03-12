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
import type { ReactionWrapper } from 'store/entities/reactions/reactions.types.ts';
import type { TemplateWrapper } from 'store/entities/templates/templates.types';
import { forwardRef, Fragment, useContext } from 'react';
import classes from './reactionPreview.module.scss';
import { useSelector } from 'react-redux';
import { selectOrderedInputsWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import { selectOrderedInputsTemplateWrapper } from 'store/entities/templates/templates.selectors.ts';
import { ReactionInputPreview } from 'features/reactions/ReactionPreview/ReactionInputPreview.tsx';
import { ReactionOutcomePreview } from 'features/reactions/ReactionPreview/ReactionOutcomePreview.tsx';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';

interface ReactionPreviewProps {
  reaction: ReactionWrapper | TemplateWrapper;
}

export const ReactionPreview = forwardRef<HTMLDivElement, Readonly<ReactionPreviewProps>>(function ReactionPreview(
  { reaction },
  ref,
) {
  const { isTemplate } = useContext(reactionEntityContext);
  const inputsTemplate = useSelector(selectOrderedInputsTemplateWrapper(reaction.id)) || [];
  const inputsReaction = useSelector(selectOrderedInputsWrapper(reaction.id)) || [];
  const inputs = isTemplate ? inputsTemplate : inputsReaction;
  const outcomes = reaction.data.outcomes;

  return (
    <div
      className={classes.wrapper}
      ref={ref}
    >
      {inputs.map((input, index) => (
        <Fragment key={input.id}>
          {index > 0 && index < inputs.length && <span className={classes.plus}>+</span>}
          <ReactionInputPreview
            reactionId={reaction.id}
            key={input.id}
            inputId={input.id}
          />
        </Fragment>
      ))}
      <span className={classes.arrow}>⟶</span>
      {outcomes.map((outcome, index) => (
        <ReactionOutcomePreview
          key={outcome.id}
          reactionId={reaction.id}
          outcomeIndex={index}
        />
      ))}
    </div>
  );
});
