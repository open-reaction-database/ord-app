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
import { create, type MessageInitShape } from '@bufbuild/protobuf';
import {
  ElectrochemistryConditionsSchema,
  ReactionConditionsSchema,
  type ElectrochemistryConditions,
  type ElectrochemistryConditions_ElectrochemistryMeasurement,
  type ElectrochemistryConditions_ElectrochemistryMeasurementSchema,
  type FlowConditions,
  type FlowConditionsSchema,
  type IlluminationConditions,
  type IlluminationConditionsSchema,
  type PressureConditions,
  type PressureConditions_PressureMeasurement,
  type PressureConditions_PressureMeasurementSchema,
  type PressureConditionsSchema,
  type ReactionConditions as OrdReactionConditions,
  type StirringConditions,
  type StirringConditionsSchema,
  type TemperatureConditions,
  type TemperatureConditions_TemperatureMeasurement,
  type TemperatureConditions_TemperatureMeasurementSchema,
  type TemperatureConditionsSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import {
  convertElectrochemistryTypeToOrd,
  ordAtmosphereToReaction,
  ordBooleanToReaction,
  ordCurrentToReaction,
  ordElectrochemistryCellToReaction,
  ordLengthToReaction,
  ordPressureControlToReaction,
  ordPressureToReaction,
  ordScalarToReaction,
  ordStirringRateToReaction,
  ordTemperatureControlToReaction,
  ordTemperatureToReaction,
  ordTimeToReaction,
  ordTubingToReaction,
  ordVoltageToReaction,
  ordWaveLengthToReaction,
  reactionAtmosphereToOrd,
  reactionBooleanToOrd,
  reactionCurrentToOrd,
  reactionElectrochemistryCellToOrd,
  reactionLengthToOrd,
  reactionPressureControlToOrd,
  reactionPressureToOrd,
  reactionStirringRateToOrd,
  reactionTemperatureControlToOrd,
  reactionTemperatureToOrd,
  reactionTimeToOrd,
  reactionTubingToOrd,
  reactionVoltageToOrd,
  reactionWaveLengthToOrd,
  withId,
} from '../reactionEntity/reactionEntity.converters';
import {
  ordFlowTypeToReaction,
  ordIlluminationTypeToReaction,
  ordPressureMeasurementTypeToReaction,
  ordStirringMethodTypeToReaction,
  ordTemperatureMeasurementTypeToReaction,
  reactionElectrochemistryTypeToOrd,
  reactionFlowTypeToOrd,
  reactionIlluminationTypeToOrd,
  reactionPressureMeasurementTypeToOrd,
  reactionStirringMethodTypeToOrd,
  reactionTemperatureMeasurementTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters';
import type {
  ElectrochemistryMeasurement,
  PressureMeasurement,
  ReactionConditions,
  ReactionElectrochemistryCondition,
  ReactionFlowCondition,
  ReactionIlluminationCondition,
  ReactionPressureCondition,
  ReactionStirringCondition,
  ReactionTemperatureCondition,
  TemperatureMeasurement,
} from './reactionConditions.types';
import type { OrdOptional } from '../reactionEntity/reactionEntity.types.ts';
import { convertObjectToUndefinedIfEmpty } from '../reactions.utils.ts';

export const ordTemperatureMeasurementToReaction = ({
  type,
  details,
  temperature,
  time,
}: TemperatureConditions_TemperatureMeasurement): TemperatureMeasurement =>
  withId({
    type: ordTemperatureMeasurementTypeToReaction(type),
    temperature: ordTemperatureToReaction(temperature),
    time: ordTimeToReaction(time),
    details: ordScalarToReaction(details),
  });

export const reactionTemperatureMeasurementToOrd = ({
  type,
  details,
  temperature,
  time,
}: TemperatureMeasurement): MessageInitShape<
  typeof TemperatureConditions_TemperatureMeasurementSchema
> => ({
  type: reactionTemperatureMeasurementTypeToOrd(type),
  temperature: reactionTemperatureToOrd(temperature),
  time: reactionTimeToOrd(time),
  details: details ?? undefined,
});

export const ordElectrochemistryMeasurementToReaction = ({
  time,
  current,
  voltage,
}: ElectrochemistryConditions_ElectrochemistryMeasurement): ElectrochemistryMeasurement =>
  withId({
    time: ordTimeToReaction(time),
    current: ordCurrentToReaction(current),
    voltage: ordVoltageToReaction(voltage),
  });

export const reactionElectrochemistryMeasurementToOrd = ({
  time,
  current,
  voltage,
}: ElectrochemistryMeasurement): MessageInitShape<
  typeof ElectrochemistryConditions_ElectrochemistryMeasurementSchema
> => ({
  time: reactionTimeToOrd(time),
  current: reactionCurrentToOrd(current),
  voltage: reactionVoltageToOrd(voltage),
});

export const ordPressureMeasurementToReaction = ({
  type,
  time,
  pressure,
  details,
}: PressureConditions_PressureMeasurement): PressureMeasurement =>
  withId({
    type: ordPressureMeasurementTypeToReaction(type),
    time: ordTimeToReaction(time),
    pressure: ordPressureToReaction(pressure),
    details: ordScalarToReaction(details),
  });

export const reactionPressureMeasurementToOrd = ({
  type,
  pressure,
  time,
  details,
}: PressureMeasurement): MessageInitShape<
  typeof PressureConditions_PressureMeasurementSchema
> => ({
  type: reactionPressureMeasurementTypeToOrd(type),
  pressure: reactionPressureToOrd(pressure),
  time: reactionTimeToOrd(time),
  details: details ?? undefined,
});

export const ordTemperatureConditionToReaction = (
  condition: OrdOptional<TemperatureConditions>,
): ReactionTemperatureCondition => ({
  control: ordTemperatureControlToReaction(condition?.control),
  setpoint: ordTemperatureToReaction(condition?.setpoint),
  temperatureMeasurements: (condition?.measurements || []).map(
    ordTemperatureMeasurementToReaction,
  ),
});

export const reactionTemperatureConditionToOrd = ({
  control,
  setpoint,
  temperatureMeasurements,
}: ReactionTemperatureCondition):
  | MessageInitShape<typeof TemperatureConditionsSchema>
  | undefined =>
  convertObjectToUndefinedIfEmpty({
    control: reactionTemperatureControlToOrd(control),
    setpoint: reactionTemperatureToOrd(setpoint),
    measurements:
      temperatureMeasurements.length > 0
        ? temperatureMeasurements.map(reactionTemperatureMeasurementToOrd)
        : undefined,
  });

const ordPressureConditionToReaction = (
  pressure: OrdOptional<PressureConditions>,
): ReactionPressureCondition => ({
  control: ordPressureControlToReaction(pressure?.control),
  setpoint: ordPressureToReaction(pressure?.setpoint),
  atmosphere: ordAtmosphereToReaction(pressure?.atmosphere),
  pressureMeasurements: (pressure?.measurements || []).map(
    ordPressureMeasurementToReaction,
  ),
});

const reactionPressureConditionToOrd = ({
  control,
  setpoint,
  atmosphere,
  pressureMeasurements,
}: ReactionPressureCondition):
  | MessageInitShape<typeof PressureConditionsSchema>
  | undefined => {
  return convertObjectToUndefinedIfEmpty({
    control: reactionPressureControlToOrd(control),
    setpoint: reactionPressureToOrd(setpoint),
    atmosphere: reactionAtmosphereToOrd(atmosphere),
    measurements:
      pressureMeasurements.length > 0
        ? pressureMeasurements.map(reactionPressureMeasurementToOrd)
        : undefined,
  });
};

export const ordStirringConditionToReaction = (
  stirring: OrdOptional<StirringConditions>,
): ReactionStirringCondition => ({
  type: ordStirringMethodTypeToReaction(stirring?.type),
  details: ordScalarToReaction(stirring?.details),
  rate: ordStirringRateToReaction(stirring?.rate),
});

export const reactionStirringConditionToOrd = ({
  type,
  details,
  rate,
}: ReactionStirringCondition):
  | MessageInitShape<typeof StirringConditionsSchema>
  | undefined =>
  convertObjectToUndefinedIfEmpty(
    {
      type: reactionStirringMethodTypeToOrd(type),
      details: details ?? undefined,
      rate: reactionStirringRateToOrd(rate),
    },
    ['type'],
  );

const ordIlluminationConditionToReaction = (
  illumination: OrdOptional<IlluminationConditions>,
): ReactionIlluminationCondition => ({
  type: ordIlluminationTypeToReaction(illumination?.type),
  peakWavelength: ordWaveLengthToReaction(illumination?.peakWavelength),
  distanceToVessel: ordLengthToReaction(illumination?.distanceToVessel),
  details: ordScalarToReaction(illumination?.details),
  color: ordScalarToReaction(illumination?.color),
});

export const reactionIlluminationConditionToOrd = ({
  type,
  peakWavelength,
  distanceToVessel,
  details,
  color,
}: ReactionIlluminationCondition):
  | MessageInitShape<typeof IlluminationConditionsSchema>
  | undefined => {
  return convertObjectToUndefinedIfEmpty(
    {
      type: reactionIlluminationTypeToOrd(type),
      peakWavelength: reactionWaveLengthToOrd(peakWavelength),
      distanceToVessel: reactionLengthToOrd(distanceToVessel),
      details: details ?? undefined,
      color: color ?? undefined,
    },
    ['type'],
  );
};

const ordElectrochemistryConditionToReaction = (
  electrochemistry: OrdOptional<ElectrochemistryConditions>,
): ReactionElectrochemistryCondition => {
  const {
    type,
    current,
    voltage,
    electrodeSeparation,
    cell,
    measurements,
    details,
    anodeMaterial,
    cathodeMaterial,
  } = electrochemistry ?? create(ElectrochemistryConditionsSchema);

  return {
    type: convertElectrochemistryTypeToOrd(type),
    current: ordCurrentToReaction(current),
    voltage: ordVoltageToReaction(voltage),
    electrodeSeparation: ordLengthToReaction(electrodeSeparation),
    cell: ordElectrochemistryCellToReaction(cell),
    electrochemistryMeasurements: measurements.map(
      ordElectrochemistryMeasurementToReaction,
    ),
    details: ordScalarToReaction(details),
    anodeMaterial: ordScalarToReaction(anodeMaterial),
    cathodeMaterial: ordScalarToReaction(cathodeMaterial),
  };
};

export const reactionElectrochemistryConditionToOrd = ({
  type,
  current,
  voltage,
  electrodeSeparation,
  cell,
  electrochemistryMeasurements,
  details,
  anodeMaterial,
  cathodeMaterial,
}: ReactionElectrochemistryCondition):
  | MessageInitShape<typeof ElectrochemistryConditionsSchema>
  | undefined => {
  return convertObjectToUndefinedIfEmpty(
    {
      type: reactionElectrochemistryTypeToOrd(type),
      current: reactionCurrentToOrd(current),
      voltage: reactionVoltageToOrd(voltage),
      electrodeSeparation: reactionLengthToOrd(electrodeSeparation),
      cell: reactionElectrochemistryCellToOrd(cell),
      measurements:
        electrochemistryMeasurements.length > 0
          ? electrochemistryMeasurements.map(reactionElectrochemistryMeasurementToOrd)
          : undefined,
      details: details ?? undefined,
      anodeMaterial: anodeMaterial ?? undefined,
      cathodeMaterial: cathodeMaterial ?? undefined,
    },
    ['type'],
  );
};

const ordFlowConditionToReaction = (
  flow: OrdOptional<FlowConditions>,
): ReactionFlowCondition => ({
  type: ordFlowTypeToReaction(flow?.type),
  tubing: ordTubingToReaction(flow?.tubing),
  details: ordScalarToReaction(flow?.details),
  pumpType: ordScalarToReaction(flow?.pumpType),
});

export const reactionFlowConditionToOrd = ({
  type,
  tubing,
  details,
  pumpType,
}: ReactionFlowCondition):
  | MessageInitShape<typeof FlowConditionsSchema>
  | undefined => {
  return convertObjectToUndefinedIfEmpty(
    {
      type: reactionFlowTypeToOrd(type),
      tubing: reactionTubingToOrd(tubing),
      details: details ?? undefined,
      pumpType: pumpType ?? undefined,
    },
    ['type'],
  );
};

export const ordConditionsToReaction = (
  conditions: OrdOptional<OrdReactionConditions>,
): ReactionConditions => {
  const {
    temperature,
    pressure,
    stirring,
    illumination,
    electrochemistry,
    flow,
    reflux,
    conditionsAreDynamic,
    details,
    ph,
  } = conditions ?? create(ReactionConditionsSchema);

  return withId({
    temperature: ordTemperatureConditionToReaction(temperature),
    pressure: ordPressureConditionToReaction(pressure),
    stirring: ordStirringConditionToReaction(stirring),
    illumination: ordIlluminationConditionToReaction(illumination),
    electrochemistry: ordElectrochemistryConditionToReaction(electrochemistry),
    flow: ordFlowConditionToReaction(flow),
    reflux: ordBooleanToReaction(reflux),
    conditionsAreDynamic: ordBooleanToReaction(conditionsAreDynamic),
    details: ordScalarToReaction(details),
    ph,
  });
};

export const reactionConditionsToOrd = ({
  temperature,
  pressure,
  stirring,
  illumination,
  electrochemistry,
  flow,
  reflux,
  conditionsAreDynamic,
  details,
  ph,
}: ReactionConditions):
  | MessageInitShape<typeof ReactionConditionsSchema>
  | undefined => {
  return convertObjectToUndefinedIfEmpty({
    temperature: reactionTemperatureConditionToOrd(temperature),
    pressure: reactionPressureConditionToOrd(pressure),
    stirring: reactionStirringConditionToOrd(stirring),
    illumination: reactionIlluminationConditionToOrd(illumination),
    electrochemistry: reactionElectrochemistryConditionToOrd(electrochemistry),
    flow: reactionFlowConditionToOrd(flow),
    reflux: reactionBooleanToOrd(reflux),
    conditionsAreDynamic: reactionBooleanToOrd(conditionsAreDynamic),
    details: details ?? undefined,
    ph: ph ?? undefined,
  });
};
