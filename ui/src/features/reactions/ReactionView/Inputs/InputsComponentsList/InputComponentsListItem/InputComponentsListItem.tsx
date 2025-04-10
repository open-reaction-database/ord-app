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
import { Accordion } from '@mantine/core';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { ComponentDisplayRow } from 'features/reactions/ReactionView/ComponentsList';
import clsx from 'clsx';
import classes from '../inputsComponentsList.module.scss';
import { useContext, useMemo } from 'react';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import type { ReactionInputWithoutName } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

interface InputComponentsListItemProps {
  name: string;
  input: ReactionInputWithoutName;
  pathComponents: ReactionPathComponents;
  historyPathComponents: Array<ReactionPathComponents>;
}

const renderDetails = ({ amount }: ReactionInputComponent) => `${amount.value ?? ''} ${amount.units}`.trim();

export function InputComponentsListItem({
  input,
  name,
  pathComponents,
  historyPathComponents,
}: Readonly<InputComponentsListItemProps>) {
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);

  const inputPathComponents = useMemo(() => {
    return [...historyPathComponents, pathComponents];
  }, [historyPathComponents, pathComponents]);

  return (
    <Accordion.Item
      key={input.id}
      value={input.id}
    >
      <Accordion.Control
        icon={
          <ViewDeleteButtonsComponent
            pathComponents={pathComponents}
            historyPathComponents={historyPathComponents}
            entityName="Input"
          />
        }
      >
        {name}
      </Accordion.Control>
      <Accordion.Panel>
        <ComponentsListOrEmpty componentsAmount={input.components.length}>
          {input.components.map((component, index) => (
            <ComponentDisplayRow
              key={component.id}
              component={component}
              renderDetails={renderDetails}
              componentPath={pathComponents.concat(['components', index])}
              historyPathComponents={inputPathComponents}
              gridClassName={clsx(classes.grid, classes.row)}
            />
          ))}
        </ComponentsListOrEmpty>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
