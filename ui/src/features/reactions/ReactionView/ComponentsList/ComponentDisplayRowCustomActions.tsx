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
import type { ComponentsDisplayRowCustomActions } from 'features/reactions/ReactionView/ComponentsList/componentsList.types.ts';
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { Flex } from '@mantine/core';
import classes from './componentsList.module.scss';
import clsx from 'clsx';
import { ReactionComponentPreview } from 'common/components/ReactionPreview/ReactionComponentPreview.tsx';
import { useSelector } from 'react-redux';
import { selectPreviewsByIdsWrapper } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.selectors.ts';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay.tsx';

export function ComponentDisplayRowCustomActions<T extends ReactionComponentBase>({
  component,
  actions,
  renderDetails,
  gridClassName = clsx(classes.grid, classes.row),
}: Readonly<ComponentsDisplayRowCustomActions<T>>) {
  const previewState = useSelector(selectPreviewsByIdsWrapper([component.id]));
  return (
    <div
      key={component.id}
      className={gridClassName}
    >
      <Flex
        className={classes.identifiers}
        direction="column"
      >
        {component.identifiers.map(identifier => (
          <KeyValueDisplay
            key={identifier.id}
            label={identifier.type}
            value={identifier.value}
          />
        ))}
      </Flex>
      <Flex
        align="center"
        justify="center"
        className={clsx(classes.preview, classes.imagePreview)}
      >
        <ReactionComponentPreview previewState={previewState[component.id]} />
      </Flex>
      <Flex
        align="center"
        className={classes.role}
      >
        {component.reactionRole}
      </Flex>
      <Flex
        align="center"
        className={classes.details}
      >
        {renderDetails(component)}
      </Flex>
      <Flex
        className={classes.actions}
        align="center"
        justify="flex-end"
      >
        {actions}
      </Flex>
    </div>
  );
}
