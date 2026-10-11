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
import { Flex, Title } from '@mantine/core';
import type { ReactionConditions } from '#reaction/model/reactionConditions/reactionConditions.types.ts';
import { renderValuePrecisionUnit } from '#reaction/view/ReactionView/renderValuePrecisionUnit.ts';
import { RequiredOptionalFields } from '#display/RequiredOptionalFields/RequiredOptionalFields.tsx';
import classes from './conditions.module.scss';
import { OpenSingleEntityButton } from '#reaction/view/ReactionView/OpenSingleEntityButton/OpenSingleEntityButton.tsx';
import { ReactionNodeValidationResult } from '#reaction/view/ReactionInteractions/ReactionNodeValidationResult/ReactionNodeValidationResult.tsx';
import { useReactionPart } from '#reaction/provider/reactionProvider.hooks.ts';

const ENTITY_FIELD = 'conditions';

export function Conditions() {
  const conditions = useReactionPart<ReactionConditions>([ENTITY_FIELD])!;

  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Flex
          align="center"
          gap="sm"
        >
          <Title order={2}>Conditions</Title>
          <ReactionNodeValidationResult pathComponents={[ENTITY_FIELD]} />
        </Flex>
        <OpenSingleEntityButton pathComponents={[ENTITY_FIELD]} />
      </Flex>
      <Flex
        direction="column"
        gap="sm"
      >
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            { label: 'Reflux', render: conditions => conditions.reflux },
            { label: 'pH', render: conditions => conditions.ph },
            {
              label: 'Dynamic conditions',
              render: conditions => conditions.conditionsAreDynamic,
            },
          ]}
        />
        <span className={classes.conditionsLabel}>Temperature</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            {
              label: 'Setpoint',
              render: ({ temperature }) =>
                temperature.setpoint && renderValuePrecisionUnit(temperature.setpoint),
            },
          ]}
          optionalFields={[
            {
              label: 'Control',
              render: ({ temperature }) => temperature.control?.type,
            },
            {
              label: 'Control Details',
              render: ({ temperature }) => temperature.control?.details,
            },
          ]}
        />
        <span className={classes.conditionsLabel}>Pressure</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            {
              label: 'Setpoint',
              render: ({ pressure }) =>
                pressure.setpoint && renderValuePrecisionUnit(pressure.setpoint),
            },
            {
              label: 'Control',
              render: ({ pressure }) => pressure.control?.type,
            },
            {
              label: 'Atmosphere',
              render: ({ pressure }) => pressure.atmosphere?.type,
            },
          ]}
        />
        <span className={classes.conditionsLabel}>Stirring</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[]}
          optionalFields={[
            {
              label: 'Method',
              render: ({ stirring }) => stirring.type,
            },
            {
              label: 'Details',
              render: ({ stirring }) => stirring.details,
            },
            {
              label: 'Rate',
              render: ({ stirring }) => stirring.rate?.type,
            },
            {
              label: 'Rate Details',
              render: ({ stirring }) => stirring.rate?.details,
            },
            {
              label: 'RPM',
              render: ({ stirring }) => stirring.rate?.rpm,
            },
          ]}
        />
        <span className={classes.conditionsLabel}>Illumination</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            {
              label: 'Type',
              render: ({ illumination }) => illumination.type,
            },
          ]}
          optionalFields={[]}
        />
        <span className={classes.conditionsLabel}>Electrochemistry</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            {
              label: 'Type',
              render: ({ electrochemistry }) => electrochemistry.type,
            },
          ]}
          optionalFields={[]}
        />
        <span className={classes.conditionsLabel}>Flow</span>
        <RequiredOptionalFields
          entity={conditions}
          requiredFields={[
            {
              label: 'Type',
              render: ({ flow }) => flow.type,
            },
          ]}
          optionalFields={[]}
        />
      </Flex>
    </Flex>
  );
}
