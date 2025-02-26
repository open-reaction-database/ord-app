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
import type { AppReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';

interface ReactionInputPreviewProps {
  reactionId: number;
  outcomeIndex: number;
}

export function ReactionOutcomePreview({ reactionId, outcomeIndex }: Readonly<ReactionInputPreviewProps>) {
  const outcome: AppReactionOutcome = useSelector(selectReactionPartByPath(reactionId, ['outcomes', outcomeIndex]));
  const componentsIds = useMemo(() => outcome.products.map(({ id }) => id), [outcome]);

  const componentsPreviews = useSelector(selectPreviewsByIdsWrapper(componentsIds));

  return (
    <div className={classes.inputCard}>
      <Badge
        variant="light"
        color="primary"
        size="lg"
      >
        Outcome
      </Badge>
      <Flex
        gap="sm"
        flex={1}
        align="center"
        mt="xs"
      >
        {componentsIds.map(id => (
          <div
            key={id}
            className={classes.component}
          >
            <div className={classes.molecule}>
              <ReactionComponentPreview previewState={componentsPreviews[id]} />
            </div>
          </div>
        ))}
      </Flex>
    </div>
  );
}
