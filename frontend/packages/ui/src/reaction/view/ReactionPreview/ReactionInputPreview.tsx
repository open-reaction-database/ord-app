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
import type { ReactionInput } from '#reaction/model/reactionsInputs/reactionInputs.types.ts';
import { useMemo } from 'react';
import classes from './reactionPreview.module.scss';
import { Badge, Flex } from '@mantine/core';
import { ReactionComponentPreview } from './ReactionComponentPreview.tsx';
import { ComponentMetadata } from './ComponentMetadata.tsx';
import {
  usePreviews,
  useReactionPart,
} from '#reaction/provider/reactionProvider.hooks.ts';

interface ReactionInputPreviewProps {
  inputId: string;
}

export function ReactionInputPreview({ inputId }: Readonly<ReactionInputPreviewProps>) {
  // The preview lists only inputs the reaction has.
  const input = useReactionPart<ReactionInput>(['inputs', inputId])!;
  const componentsIds = useMemo(() => input.components.map(({ id }) => id), [input]);
  const componentsPreviews = usePreviews(componentsIds);

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
