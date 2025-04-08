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
import type { ReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { Accordion, Text } from '@mantine/core';
import { useContext } from 'react';
import classes from './inputsComponentsList.module.scss';
import clsx from 'clsx';
import { ComponentDisplayRow } from '../../ComponentsList';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { componentsListClasses } from 'features/reactions/ReactionView/ComponentsList';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';

interface InputsComponentsListProps {
  inputs: Array<ReactionInput>;
}

const headers = [
  { label: 'Input', className: classes.input },
  { label: 'Identifiers', className: componentsListClasses.identifiers },
  { label: 'Preview', className: componentsListClasses.preview },
  { label: 'Role', className: componentsListClasses.role },
  { label: 'Amount', className: componentsListClasses.details },
];

const renderDetails = ({ amount }: ReactionInputComponent) => `${amount.value ?? ''} ${amount.units}`.trim();

export function InputsComponentsList({ inputs }: Readonly<InputsComponentsListProps>) {
  const ids = inputs.map(input => input.id);
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);

  return (
    <>
      <div className={classes.grid}>
        {headers.map(({ label, className }) => (
          <Text
            size="md"
            className={clsx(classes.text, className)}
            key={label}
          >
            {label}
          </Text>
        ))}
      </div>
      <Accordion
        variant="separated"
        chevronPosition="left"
        multiple={true}
        defaultValue={ids}
      >
        {inputs.map(input => (
          <Accordion.Item
            key={input.id}
            value={input.id}
          >
            <Accordion.Control
              icon={
                <ViewDeleteButtonsComponent
                  pathComponents={['inputs', input.id]}
                  entityName="Input"
                />
              }
            >
              {input.name}
            </Accordion.Control>
            <Accordion.Panel>
              <ComponentsListOrEmpty componentsAmount={input.components.length}>
                {input.components.map((component, index) => (
                  <ComponentDisplayRow
                    key={component.id}
                    component={component}
                    renderDetails={renderDetails}
                    componentPath={['inputs', input.id, 'components', index]}
                    gridClassName={clsx(classes.grid, classes.row)}
                  />
                ))}
              </ComponentsListOrEmpty>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}
