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
import { useContext } from 'react';
import { reactionContext } from '../../reactions.context.ts';
import { Accordion, Button, Flex, Title } from '@mantine/core';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { useSelector } from 'react-redux';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { AddCircleIcon } from 'common/icons';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { ord } from 'ord-schema-protobufjs';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { ordWorkupToReaction } from 'store/entities/reactions/reactionWorkups/reactionWorkups.converters.ts';
import type { ReactionWorkup } from 'store/entities/reactions/reactionWorkups/reactionWorkups.types.ts';
import { RequiredOptionalFields } from 'common/components/display/RequiredOptionalFields/RequiredOptionalFields.tsx';
import type { FieldConfiguration } from 'common/components/display/RequiredOptionalFields/requiredOptionalFields.types.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { renderValuePrecisionUnit } from '../renderValuePrecisionUnit.ts';
import { WorkupConstants } from 'store/entities/reactions/reactionWorkups/reactionWorkups.constants.ts';
import { InputComponentsListItem } from '../Inputs/InputsComponentsList/InputComponentsListItem/InputComponentsListItem.tsx';

const ENTITY_FIELD = 'workups';

const workupRequiredFields: Array<FieldConfiguration<ReactionWorkup>> = [{ label: 'Type', render: item => item.type }];

const workupOptionalFields: Array<FieldConfiguration<ReactionWorkup>> = [
  {
    label: 'Keep Phase',
    render: item => (WorkupConstants.keepPhaseCompatibleTypes.includes(item.type) ? item.keepPhase : ''),
  },
  {
    label: 'Target PH',
    render: item => (WorkupConstants.targetPhCompatibleTypes.includes(item.type) ? item.targetPh : ''),
  },
  {
    label: 'Duration',
    render: item =>
      WorkupConstants.durationCompatibleTypes.includes(item.type) && item.duration
        ? renderValuePrecisionUnit(item.duration)
        : '',
  },
  { label: 'Automated', render: item => (item.isAutomated === ReactionBoolean.Unspecified ? '' : item.isAutomated) },
  { label: 'Details', render: item => item.details },
  {
    label: 'Aliqout Amount',
    render: item =>
      WorkupConstants.aliquotCompatibleTypes.includes(item.type) && item.amount
        ? renderValuePrecisionUnit(item.amount)
        : '',
  },
  {
    label: 'Temperature',
    render: item =>
      WorkupConstants.temperatureCompatibleTypes.includes(item.type) ? (
        <RequiredOptionalFields
          entity={item}
          requiredFields={[
            {
              label: 'Setpoint',
              render: ({ temperature }) => temperature?.setpoint && renderValuePrecisionUnit(temperature.setpoint),
            },
          ]}
          optionalFields={[
            {
              label: 'Control Type',
              render: ({ temperature }) => temperature?.control?.type,
            },
            {
              label: 'Control Details',
              render: ({ temperature }) => temperature?.control?.details,
            },
          ]}
        />
      ) : (
        ''
      ),
  },
  {
    label: 'Stirring',
    render: item =>
      WorkupConstants.stirringCompatibleTypes.includes(item.type) ? (
        <RequiredOptionalFields
          entity={item}
          requiredFields={[]}
          optionalFields={[
            {
              label: 'Method',
              render: ({ stirring }) => stirring?.type,
            },
            {
              label: 'Details',
              render: ({ stirring }) => stirring?.details,
            },
            {
              label: 'Rate',
              render: ({ stirring }) => stirring?.rate?.type,
            },
            {
              label: 'Rate Details',
              render: ({ stirring }) => stirring?.rate?.details,
            },
            {
              label: 'RPM',
              render: ({ stirring }) => stirring?.rate?.rpm,
            },
          ]}
        />
      ) : (
        ''
      ),
  },
];

export function Workups() {
  const dispatch = useAppDispatch();
  const { isViewOnly, reactionId, ViewDeleteButtonsComponent } = useContext(reactionContext);
  const workups: Array<ReactionWorkup> = useSelector(selectReactionPartByPath(reactionId, [ENTITY_FIELD]));

  const onWorkupCreate = () => {
    const newIdentifierPath: ReactionPathComponents = [ENTITY_FIELD, workups.length];
    const newWorkup = ordWorkupToReaction(ord.ReactionWorkup.toObject(new ord.ReactionWorkup()));

    dispatch(addUpdateReactionField({ reactionId, pathComponents: newIdentifierPath, newValue: newWorkup }));
    dispatch(setReactionPathComponentsList([newIdentifierPath]));
  };

  return (
    <Flex
      direction="column"
      gap="md"
    >
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Workups</Title>
          <Counter amount={workups.length} />
        </Flex>
        {!isViewOnly && (
          <Button
            onClick={onWorkupCreate}
            leftSection={<AddCircleIcon />}
          >
            Workup
          </Button>
        )}
      </Flex>
      <span>
        Workup steps refer to any additions, purifications, or other operations after the ‘reaction’ stage prior to
        analysis
      </span>
      <Flex
        direction="column"
        gap="sm"
      >
        {workups.map((workup, index) => (
          <Flex
            direction="column"
            key={workup.id}
          >
            <Flex align="center">
              <Title order={3}>Workup {index + 1}</Title>
              <ViewDeleteButtonsComponent
                entityName="Workup"
                pathComponents={[ENTITY_FIELD, index]}
              />
            </Flex>
            <RequiredOptionalFields
              entity={workup}
              requiredFields={workupRequiredFields}
              optionalFields={workupOptionalFields}
            />
            {WorkupConstants.inputCompatibleTypes.includes(workup.type) && workup.input && (
              <Accordion
                variant="separated"
                chevronPosition="left"
                multiple={true}
                defaultValue={[workup.input.id]}
              >
                <InputComponentsListItem
                  input={workup.input}
                  name="Input"
                  pathComponents={[ENTITY_FIELD, index, 'input']}
                  historyPathComponents={[[ENTITY_FIELD, index]]}
                />
              </Accordion>
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
