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
import { Accordion, Flex, Text } from '@mantine/core';
import type { ReactionOutcome } from '#reaction/model/reactionsOutcomes/reactionOutcomes.types.ts';
import type { ReactionProduct } from '#reaction/model/reactionComponent/reactionComponent.types.ts';
import { useMemo } from 'react';
import {
  ComponentDisplayRow,
  componentsListClasses,
} from '#reaction/view/ReactionView/ComponentsList/index.ts';
import clsx from 'clsx';
import classes from './outcomeListItem.module.scss';
import { compareNamedEntities } from '#reaction/view/ReactionEntities/entityFormConfiguration/compareNamedEntities.ts';
import { KeyValueDisplay } from '#display/KeyValueDisplay/KeyValueDisplay.tsx';
import { OutcomeListItemHeader } from './OutcomeListItemHeader.tsx';
import { MeasurementsPreview } from '#reaction/view/ReactionView/Outcomes/MeasurementsPreview/MeasurementsPreview.tsx';

const ENTITY_NAME = 'outcomes';

interface OutcomeListItemProps {
  outcome: ReactionOutcome;
  outcomeIndex: number;
}

const headers = [
  { label: 'Identifiers', className: componentsListClasses.identifiers },
  { label: 'Preview', className: componentsListClasses.preview },
  { label: 'Role', className: componentsListClasses.role },
  { label: 'Measurements', className: componentsListClasses.details },
];

const renderDetails = (product: ReactionProduct) => (
  <MeasurementsPreview product={product} />
);

export function OutcomeListItem({
  outcome,
  outcomeIndex,
}: Readonly<OutcomeListItemProps>) {
  const outcomePathComponents = useMemo(
    () => [ENTITY_NAME, outcomeIndex],
    [outcomeIndex],
  );

  const orderedAnalyses = useMemo(() => {
    return Object.values(outcome.analyses).sort(compareNamedEntities);
  }, [outcome.analyses]);

  return (
    <Accordion.Item value={outcome.id}>
      <OutcomeListItemHeader
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
            component={product}
            renderDetails={renderDetails}
            componentPath={outcomePathComponents.concat(['products', productIndex])}
            historyPathComponents={[outcomePathComponents]}
          />
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
