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
import { selectTemplatePartByPath } from 'store/entities/templates/templates.selectors.ts';
import type { AppReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import { useMemo, useContext } from 'react';
import classes from 'features/reactions/ReactionPreview/reactionPreview.module.scss';
import { Badge, Flex, Text } from '@mantine/core';
import { ReactionComponentPreview } from 'features/reactions/ReactionPreview/ReactionComponentPreview.tsx';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';

interface ReactionInputPreviewProps {
  reactionId: number;
  inputId: string;
}

interface ComponentMetadataProps {
  component: ReactionInputComponent;
}

function ComponentMetadata({ component }: Readonly<ComponentMetadataProps>) {
  const name = useMemo(() => {
    return (component.identifiers || []).find(identifier => identifier.type === 'NAME');
  }, [component]);

  return (
    <Flex direction="column">
      {name?.value && <Text size="xs">{name.value}</Text>}
      {component?.reactionRole && <Text size="xs">{component.reactionRole}</Text>}
      {component?.amount && (
        <Text size="xs">
          {component.amount.value} {component.amount.units}
        </Text>
      )}
    </Flex>
  );
}

export function ReactionInputPreview({ reactionId, inputId }: Readonly<ReactionInputPreviewProps>) {
  const { isTemplate } = useContext(reactionEntityContext);
  const inputReaction: AppReactionInput = useSelector(selectReactionPartByPath(reactionId, ['inputs', inputId])) || [];
  const inputTemplate: AppReactionInput = useSelector(selectTemplatePartByPath(reactionId, ['inputs', inputId])) || [];
  const input = isTemplate ? inputTemplate : inputReaction;
  const componentsIds = useMemo(() => input?.components.map(({ id }) => id), [input]);

  const componentsPreviews = useSelector(selectPreviewsByIdsWrapper(componentsIds));

  return (
    <div className={classes.inputCard}>
      <Badge
        variant="light"
        color="primary"
        size="lg"
      >
        {input?.name}
      </Badge>
      <Flex
        gap="sm"
        align="center"
        className={classes.componentList}
      >
        {componentsIds?.map((id, index) => (
          <div
            key={id}
            className={classes.component}
          >
            <div className={classes.molecule}>
              <ReactionComponentPreview previewState={componentsPreviews[id]} />
            </div>
            <ComponentMetadata component={input?.components[index]} />
          </div>
        ))}
      </Flex>
    </div>
  );
}
