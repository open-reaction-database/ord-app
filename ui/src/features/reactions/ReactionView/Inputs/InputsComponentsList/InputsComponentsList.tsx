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
import { Accordion, Divider, Flex, Text } from '@mantine/core';
import { ReactionEntityDelete } from 'features/reactions/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import { useCallback, useContext, type MouseEvent } from 'react';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import classes from './inputsComponentsList.module.scss';
import clsx from 'clsx';
import { EditButton } from 'common/components/EditButton/EditButton.tsx';
import { ComponentDisplayRow } from '../../ComponentsList/ComponentDisplayRow';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { componentsListClasses } from 'features/reactions/ReactionView/ComponentsList';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { templatesContext } from 'features/templates/templates.context';

interface InputsComponentsListProps {
  reactionId: ReactionId;
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

const onActionClick = (event: MouseEvent) => {
  event.stopPropagation();
};

export function InputsComponentsList({ reactionId, inputs }: Readonly<InputsComponentsListProps>) {
  const dispatch = useAppDispatch();
  const onEditInput = useCallback(
    (id: string) => {
      dispatch(setReactionPathComponentsList([['inputs', id]]));
    },
    [dispatch],
  );
  const { isTemplate } = useContext(templatesContext);

  const ids = inputs.map(input => input.id);

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
                !isTemplate && (
                  <Flex
                    onClick={onActionClick}
                    align="center"
                  >
                    <EditButton onClick={() => onEditInput(input.id)} />
                    <Divider
                      className={classes.actionDivider}
                      orientation="vertical"
                    />
                    <ReactionEntityDelete
                      reactionId={reactionId}
                      entityName="Input"
                      pathComponents={['inputs', input.id]}
                    />
                  </Flex>
                )
              }
            >
              {input.name}
            </Accordion.Control>
            <Accordion.Panel>
              {input.components.map((component, index) => (
                <ComponentDisplayRow
                  key={component.id}
                  reactionId={reactionId}
                  component={component}
                  renderDetails={renderDetails}
                  componentPath={['inputs', input.id, 'components', index]}
                  gridClassName={clsx(classes.grid, classes.row)}
                />
              ))}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}
