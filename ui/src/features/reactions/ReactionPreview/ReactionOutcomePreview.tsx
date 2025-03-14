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
import classes from 'features/reactions/ReactionPreview/reactionPreview.module.scss';
import { Badge, Flex } from '@mantine/core';
import { ReactionComponentPreview } from 'features/reactions/ReactionPreview/ReactionComponentPreview.tsx';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { useMemo } from 'react';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { ComponentMetadata } from 'features/reactions/ReactionPreview/ComponentMetadata.tsx';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface ReactionInputPreviewProps {
  reactionId: ReactionId;
  outcomeIndex: number;
}

export function ReactionOutcomePreview({ reactionId, outcomeIndex }: Readonly<ReactionInputPreviewProps>) {
  const outcome: ReactionOutcome = useSelector(selectReactionPartByPath(reactionId, ['outcomes', outcomeIndex]));
  const componentsIds = useMemo(() => outcome.products.map(({ id }) => id), [outcome]);
  const componentsPreviews = useSelector(selectPreviewsByIdsWrapper(componentsIds));
  const outcomeTime = useMemo(() => {
    return outcome.reactionTime?.value ? renderValuePrecisionUnit(outcome.reactionTime) : '';
  }, [outcome.reactionTime]);

  return (
    <div className={classes.inputCard}>
      <Badge
        variant="light"
        color="primary"
        size="lg"
      >
        Outcome ({outcomeTime})
      </Badge>
      <Flex
        gap="sm"
        align="center"
        className={classes.componentList}
      >
        {componentsIds.length === 0 ? (
          <ReactionComponentPreview previewState={null} />
        ) : (
          componentsIds.map((id, index) => {
            const product = outcome.products[index];

            return (
              <div
                key={id}
                className={classes.component}
              >
                <div className={classes.molecule}>
                  <ReactionComponentPreview previewState={componentsPreviews[id]} />
                </div>
                {product?.isDesiredProduct === ReactionBoolean.True && (
                  <Badge classNames={{ root: classes.desiredProductBadge, label: classes.badgeLabel }}>
                    ✨ Desired
                  </Badge>
                )}
                <ComponentMetadata component={product} />
              </div>
            );
          })
        )}
      </Flex>
    </div>
  );
}
