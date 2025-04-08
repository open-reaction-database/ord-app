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
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { ComponentDisplayRow } from 'features/reactions/ReactionView/ComponentsList/ComponentDisplayRow.tsx';
import classes from './componentsList.module.scss';
import clsx from 'clsx';
import { Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface ComponentsListHeaderProps {
  detailsHeader: string;
}

interface ComponentsListProps<T extends ReactionComponentBase> extends ComponentsListHeaderProps {
  rootPathComponents: ReactionPathComponents;
  components: Array<T>;
  entityName: string;
  renderDetails: (component: T) => ReactNode;
}

export function ComponentsListHeader({ detailsHeader }: Readonly<ComponentsListHeaderProps>) {
  return (
    <div className={clsx(classes.grid, classes.row)}>
      <Text
        size="md"
        className={clsx(classes.text, classes.identifiers)}
      >
        Identifiers
      </Text>
      <Text
        size="md"
        className={clsx(classes.text, classes.preview)}
      >
        Preview
      </Text>
      <Text
        size="md"
        className={clsx(classes.text, classes.role)}
      >
        Role
      </Text>
      <Text
        size="md"
        className={clsx(classes.text, classes.details)}
      >
        {detailsHeader}
      </Text>
      <div className={classes.actions}></div>
    </div>
  );
}

export function ComponentsList<T extends ReactionComponentBase>({
  rootPathComponents,
  components,
  detailsHeader,
  renderDetails,
  entityName,
}: Readonly<ComponentsListProps<T>>) {
  return (
    <>
      <ComponentsListHeader detailsHeader={detailsHeader} />
      {components.map((component, index) => (
        <ComponentDisplayRow
          key={component.id}
          componentPath={[...rootPathComponents, entityName, index]}
          renderDetails={renderDetails}
          component={component}
        />
      ))}
    </>
  );
}
