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
import { ComponentsListOrEmpty } from '#display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { ComponentDisplayRow } from '#reaction/view/ReactionView/ComponentsList/index.ts';
import clsx from 'clsx';
import classes from '#reaction/view/ReactionView/Inputs/InputsComponentsList/inputsComponentsList.module.scss';
import { useMemo } from 'react';
import { useReactionSlots } from '#reaction/provider/reactionProvider.hooks.ts';
import type { ReactionInputWithoutName } from '#reaction/model/reactionsInputs/reactionInputs.types.ts';
import type { ReactionInputComponent } from '#reaction/model/reactionComponent/reactionComponent.types.ts';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { renderValuePrecisionUnit } from '#reaction/view/ReactionView/renderValuePrecisionUnit.ts';

interface InputComponentsListItemProps {
  name: string;
  input: ReactionInputWithoutName;
  pathComponents: ReactionPathComponents;
  historyPathComponents: Array<ReactionPathComponents>;
}

const renderDetails = ({ amount }: ReactionInputComponent) =>
  renderValuePrecisionUnit(amount);

export function InputComponentsListItem({
  input,
  name,
  pathComponents,
  historyPathComponents,
}: Readonly<InputComponentsListItemProps>) {
  const { ViewDeleteButtons } = useReactionSlots();

  const inputPathComponents = useMemo(() => {
    return [...historyPathComponents, pathComponents];
  }, [historyPathComponents, pathComponents]);

  return (
    <Accordion.Item
      key={input.id}
      value={input.id}
    >
      {/* The view/delete buttons sit beside Accordion.Control rather than in its `icon`
          slot: Accordion.Control renders a <button>, and a nested <button> triggers a
          hydration error. */}
      <div className={classes.controlRow}>
        <ViewDeleteButtons
          pathComponents={pathComponents}
          historyPathComponents={historyPathComponents}
          entityName="Input"
        />
        <Accordion.Control className={classes.control}>{name}</Accordion.Control>
      </div>
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
