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
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import { useMemo } from 'react';
import classes from 'features/reactions/ReactionPreview/reactionPreview.module.scss';
import { Badge, Flex } from '@mantine/core';
import { ReactionComponentPreview } from 'features/reactions/ReactionPreview/ReactionComponentPreview.tsx';
import { ComponentMetadata } from 'features/reactions/ReactionPreview/ComponentMetadata.tsx';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface ReactionInputPreviewProps {
  reactionId: ReactionId;
  inputId: string;
}

export function ReactionInputPreview({ reactionId, inputId }: Readonly<ReactionInputPreviewProps>) {
  const input: ReactionInput = useSelector(selectReactionPartByPath(reactionId, ['inputs', inputId]));
  const componentsIds = useMemo(() => input.components.map(({ id }) => id), [input]);
  const componentsPreviews = useSelector(selectPreviewsByIdsWrapper(componentsIds));

  return (
    <div className={classes.inputCard}>
      <Badge
        variant="light"
        color="primary"
        size="lg"
      >
        {input.name}
      </Badge>
      <Flex
        gap="sm"
        align="center"
        className={classes.componentList}
      >
        {componentsIds.length === 0 ? (
          <ReactionComponentPreview previewState={null} />
        ) : (
          componentsIds.map((id, index) => (
            <div
              key={id}
              className={classes.component}
            >
              <div className={classes.molecule}>
                <ReactionComponentPreview previewState={componentsPreviews[id]} />
              </div>
              <ComponentMetadata component={input.components[index]} />
            </div>
          ))
        )}
      </Flex>
    </div>
  );
}
