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
import type {
  ReactionMeasurement,
  ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { useMemo } from 'react';
import { renderValuePrecisionUnit } from '../../renderValuePrecisionUnit.ts';
import { Flex, Text, Tooltip } from '@mantine/core';
import classes from './measurementPreview.module.scss';

interface MeasurementPreviewProps {
  measurement: ReactionMeasurement;
}

interface MeasurementsPreviewProps {
  product: ReactionProduct;
}

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

export function MeasurementsPreview({ product }: Readonly<MeasurementsPreviewProps>) {
  return (
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
}
