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
import { Accordion, Flex, Text, Tooltip } from '@mantine/core';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types';
import { useMemo } from 'react';
import { ComponentDisplayRow, componentsListClasses } from 'features/reactions/ReactionView/ComponentsList';
import clsx from 'clsx';
import classes from './outcomeListItem.module.scss';
import { compareNamedEntities } from 'features/reactions/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay.tsx';
import type {
  ReactionMeasurement,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { renderValuePrecisionUnit } from '../../renderValuePrecisionUnit';
import { OutcomeListItemHeader } from 'features/reactions/ReactionView/Outcomes/OutcomeListItem/OutcomeListItemHeader.tsx';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

const ENTITY_NAME = 'outcomes';

interface OutcomeListItemProps {
  reactionId: ReactionId;
  outcome: ReactionOutcome;
  outcomeIndex: number;
}

interface MeasurementPreviewProps {
  measurement: ReactionMeasurement;
}

const headers = [
  { label: 'Identifiers', className: componentsListClasses.identifiers },
  { label: 'Preview', className: componentsListClasses.preview },
  { label: 'Role', className: componentsListClasses.role },
  { label: 'Measurements', className: componentsListClasses.details },
];

function MeasurementPreview({ measurement }: Readonly<MeasurementPreviewProps>) {
  const valuePreview = useMemo(() => {
    if (!measurement.value) return null;
    if (measurement.value.type === 'Mass') {
      return renderValuePrecisionUnit(measurement.value.value);
    } else if (measurement.value.type === 'String') {
      return measurement.value.value;
    } else {
      const postfix = measurement.value.type === '%' ? '%' : '';
      return renderValuePrecisionUnit({ ...measurement.value.value, units: postfix });
    }
  }, [measurement.value]);

  return (
    <Flex
      gap="sm"
      wrap="nowrap"
      className={classes.measurementWrapper}
    >
      {measurement.type && <Text className={classes.measurementKeyType}>{measurement.type}</Text>}
      {measurement?.analysis?.name && <Text className={classes.measurementKeyType}>{measurement?.analysis?.name}</Text>}
      {measurement.value && (
        <Tooltip label={valuePreview}>
          <Text className={classes.measurementValue}>{valuePreview}</Text>
        </Tooltip>
      )}
    </Flex>
  );
}

const renderDetails = (product: ReactionProduct) => (
  <Flex
    direction="column"
    gap="xs"
  >
    {product.measurements.map(measurement => (
      <MeasurementPreview
        key={measurement.id}
        measurement={measurement}
      />
    ))}
  </Flex>
);

export function OutcomeListItem({ reactionId, outcome, outcomeIndex }: Readonly<OutcomeListItemProps>) {
  const outcomePathComponents = useMemo(() => [ENTITY_NAME, outcomeIndex], [outcomeIndex]);

  const orderedAnalyses = useMemo(() => {
    return Object.values(outcome.analyses).sort(compareNamedEntities);
  }, [outcome.analyses]);

  return (
    <Accordion.Item value={outcome.id}>
      <OutcomeListItemHeader
        reactionId={reactionId}
        outcome={outcome}
        pathComponents={outcomePathComponents}
      />
      <Accordion.Panel>
        <div className={classes.analysesList}>
          {orderedAnalyses.map(analysis => (
            <Flex
              key={analysis.id}
              className={classes.analysesItem}
              direction="column"
            >
              <KeyValueDisplay
                label="Type"
                value={analysis.type}
              />
              <KeyValueDisplay
                label="Name"
                value={analysis.name}
              />
              <KeyValueDisplay
                label="Details"
                value={analysis.details}
              />
            </Flex>
          ))}
        </div>
        <div className={componentsListClasses.grid}>
          {headers.map(({ label, className }) => (
            <Text
              className={clsx(classes.text, className)}
              key={label}
            >
              {label}
            </Text>
          ))}
        </div>
        {outcome.products.map((product, productIndex) => (
          <ComponentDisplayRow
            key={product.id}
            reactionId={reactionId}
            component={product}
            renderDetails={renderDetails}
            componentPath={outcomePathComponents.concat(['products', productIndex])}
          />
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
