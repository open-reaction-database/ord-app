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
import { ord } from 'ord-schema-protobufjs';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';

const generateOptionsAndByValue = <T extends string>(entities: Record<T, number>) => ({
  options: Object.keys(entities),
  byValue: reversePrimitiveRecord<T, number>(entities),
});

export const { options: reactionRoleOptions, byValue: reactionRoleByValue } = generateOptionsAndByValue(
  ord.ReactionRole.ReactionRoleType,
);

export const { options: preparationTypeOptions, byValue: preparationTypeByValue } = generateOptionsAndByValue(
  ord.CompoundPreparation.CompoundPreparationType,
);

export const { options: timeTypeOptions, byValue: timeTypeByValue } = generateOptionsAndByValue(ord.Time.TimeUnit);

export const { options: additionDeviceTypeOptions, byValue: reactionAdditionDeviceByValue } = generateOptionsAndByValue(
  ord.ReactionInput.AdditionDevice.AdditionDeviceType,
);

export const { options: additionSpeedTypeOptions, byValue: additionSpeedTypeByValue } = generateOptionsAndByValue(
  ord.ReactionInput.AdditionSpeed.AdditionSpeedType,
);

export const { options: flowRateOptions, byValue: flowRateTypeByValue } = generateOptionsAndByValue(
  ord.FlowRate.FlowRateUnit,
);

export const { options: temperatureOptions, byValue: temperatureTypeByValue } = generateOptionsAndByValue(
  ord.Temperature.TemperatureUnit,
);

export const { options: textureTypeOptions, byValue: textureTypeByValue } = generateOptionsAndByValue(
  ord.Texture.TextureType,
);

export const { options: analysisOptions, byValue: analysisTypeByValue } = generateOptionsAndByValue(
  ord.Analysis.AnalysisType,
);

export const { options: reactionIdentifierTypeOptions, byValue: reactionIdentifierTypeByValue } =
  generateOptionsAndByValue(ord.ReactionIdentifier.ReactionIdentifierType);

export const { options: measurementsTypeOptions, byValue: measurementTypeByValue } = generateOptionsAndByValue(
  ord.ProductMeasurement.ProductMeasurementType,
);

export const { options: selectivityTypeOptions, byValue: selectivityTypeByValue } = generateOptionsAndByValue(
  ord.ProductMeasurement.Selectivity.SelectivityType,
);

export const { options: waveLengthTypeOptions, byValue: waveLengthTypeByValue } = generateOptionsAndByValue(
  ord.Wavelength.WavelengthUnit,
);

export const { options: massSpecTypeOptions, byValue: massSpecTypeByValue } = generateOptionsAndByValue(
  ord.ProductMeasurement.MassSpecMeasurementDetails.MassSpecMeasurementType,
);

export const { options: compoundIdentifierTypeOptions, byValue: compoundIdentifierTypeByValue } =
  generateOptionsAndByValue(ord.CompoundIdentifier.CompoundIdentifierType);
