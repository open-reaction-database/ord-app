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
import {
  ordBooleanToReaction,
  ordTemperatureToReaction,
  ordPressureToReaction,
  reactionBooleanToOrd,
  reactionPressureToOrd,
  withId,
  ordWaveLengthToReaction,
  reactionWaveLengthToOrd,
  ordLengthToReaction,
  reactionLengthToOrd,
  reactionCurrentToOrd,
  ordCurrentToReaction,
  convertElectrochemistryTypeToOrd,
  reactionTemperatureControlToOrd,
  reactionTemperatureToOrd,
  ordTemperatureControlToReaction,
  withoutId,
  ordPressureControlToReaction,
  ordAtmosphereToReaction,
  reactionPressureControlToOrd,
  reactionAtmosphereToOrd,
  ordStirringRateToReaction,
  reactionStirringRateToOrd,
  ordElectrochemistryCellToReaction,
  ordVoltageToReaction,
  reactionVoltageToOrd,
  reactionElectrochemistryCellToOrd,
  ordTubingToReaction,
  reactionTubingToOrd,
  ordTimeToReaction,
  reactionTimeToOrd,
} from '../reactionEntity/reactionEntity.converters';
import {
  ordStirringMethodTypeToReaction,
  reactionStirringMethodTypeToOrd,
  ordIlluminationTypeToReaction,
  reactionIlluminationTypeToOrd,
  reactionElectrochemistryTypeToOrd,
  ordFlowTypeToReaction,
  reactionFlowTypeToOrd,
  ordTemperatureMeasurementTypeToReaction,
  reactionTemperatureMeasurementTypeToOrd,
  ordPressureMeasurementTypeToReaction,
  reactionPressureMeasurementTypeToOrd,
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

export const ordTemperatureMeasurementToReaction = ({
  type,
  details,
  temperature,
  time,
}: ord.TemperatureConditions.ITemperatureMeasurement): TemperatureMeasurement =>
  withId({
    type: ordTemperatureMeasurementTypeToReaction(type),
    temperature: ordTemperatureToReaction(temperature),
    time: ordTimeToReaction(time),
    details,
  });

export const reactionTemperatureMeasurementToOrd = ({
  type,
  details,
  temperature,
  time,
}: TemperatureMeasurement): ord.TemperatureConditions.ITemperatureMeasurement => ({
  type: reactionTemperatureMeasurementTypeToOrd(type),
  temperature: reactionTemperatureToOrd(temperature),
  time: reactionTimeToOrd(time),
  details,
});

export const ordElectrochemistryMeasurementToReaction = ({
  time,
  current,
  voltage,
}: ord.ElectrochemistryConditions.IElectrochemistryMeasurement): ElectrochemistryMeasurement =>
  withId({
    time: ordTimeToReaction(time),
    current: ordCurrentToReaction(current),
    voltage: ordVoltageToReaction(voltage),
  });

export const reactionElectrochemistryMeasurementToOrd = ({
  time,
  current,
  voltage,
}: ElectrochemistryMeasurement): ord.ElectrochemistryConditions.IElectrochemistryMeasurement => ({
  time: reactionTimeToOrd(time),
  current: reactionCurrentToOrd(current),
  voltage: reactionVoltageToOrd(voltage),
});

export const ordPressureMeasurementToReaction = ({
  type,
  time,
  pressure,
  details,
}: ord.PressureConditions.IPressureMeasurement): PressureMeasurement =>
  withId({
    type: ordPressureMeasurementTypeToReaction(type),
    time: ordTimeToReaction(time),
    pressure: ordPressureToReaction(pressure),
    details,
  });

export const reactionPressureMeasurementToOrd = ({
  type,
  pressure,
  time,
  details,
}: PressureMeasurement): ord.PressureConditions.IPressureMeasurement => ({
  type: reactionPressureMeasurementTypeToOrd(type),
  pressure: reactionPressureToOrd(pressure),
  time: reactionTimeToOrd(time),
  details,
});

export const ordTemperatureConditionToReaction = (
  condition: OrdOptional<ord.ITemperatureConditions>,
): ReactionTemperatureCondition => {
  const { control, setpoint, measurements } = condition ?? {};
  return {
    control: ordTemperatureControlToReaction(control),
    setpoint: ordTemperatureToReaction(setpoint),
    temperatureMeasurements: (measurements || []).map(ordTemperatureMeasurementToReaction),
  };
};

export const reactionTemperatureConditionToOrd = ({
  control,
  setpoint,
  temperatureMeasurements,
}: ReactionTemperatureCondition): ord.ITemperatureConditions => ({
  control: reactionTemperatureControlToOrd(control),
  setpoint: reactionTemperatureToOrd(setpoint),
  measurements:
    temperatureMeasurements.length > 0 ? temperatureMeasurements.map(reactionTemperatureMeasurementToOrd) : null,
});

const ordPressureConditionToReaction = (pressure: OrdOptional<ord.IPressureConditions>): ReactionPressureCondition => {
  const { setpoint, atmosphere, control, measurements } = pressure ?? {};
  return {
    control: ordPressureControlToReaction(control),
    setpoint: ordPressureToReaction(setpoint),
    atmosphere: ordAtmosphereToReaction(atmosphere),
    pressureMeasurements: (measurements || []).map(ordPressureMeasurementToReaction),
  };
};

const reactionPressureConditionToOrd = ({
  control,
  setpoint,
  atmosphere,
  pressureMeasurements,
}: ReactionPressureCondition): ord.IPressureConditions => {
  return {
    control: reactionPressureControlToOrd(control),
    setpoint: reactionPressureToOrd(setpoint),
    atmosphere: reactionAtmosphereToOrd(atmosphere),
    measurements: pressureMeasurements.length > 0 ? pressureMeasurements.map(reactionPressureMeasurementToOrd) : null,
  };
};

export const ordStirringConditionToReaction = (
  stirring: OrdOptional<ord.IStirringConditions>,
): ReactionStirringCondition => {
  const { type, details, rate } = stirring ?? {};

  return {
    type: ordStirringMethodTypeToReaction(type),
    details,
    rate: ordStirringRateToReaction(rate),
  };
};

export const reactionStirringConditionToOrd = ({
  type,
  details,
  rate,
}: ReactionStirringCondition): ord.IStirringConditions => ({
  type: reactionStirringMethodTypeToOrd(type),
  details,
  rate: reactionStirringRateToOrd(rate),
});

const ordIlluminationConditionToReaction = (
  illumination: OrdOptional<ord.IIlluminationConditions>,
): ReactionIlluminationCondition => {
  const { type, peakWavelength, distanceToVessel, ...rest } = illumination ?? {};

  return {
    type: ordIlluminationTypeToReaction(type),
    peakWavelength: ordWaveLengthToReaction(peakWavelength),
    distanceToVessel: ordLengthToReaction(distanceToVessel),
    ...rest,
  };
};

export const reactionIlluminationConditionToOrd = ({
  type,
  peakWavelength,
  distanceToVessel,
  ...rest
}: ReactionIlluminationCondition) => {
  return {
    type: reactionIlluminationTypeToOrd(type),
    peakWavelength: reactionWaveLengthToOrd(peakWavelength),
    distanceToVessel: reactionLengthToOrd(distanceToVessel),
    ...rest,
  };
};

const ordElectrochemistryConditionToReaction = (
  electrochemistry: OrdOptional<ord.IElectrochemistryConditions>,
): ReactionElectrochemistryCondition => {
  const { type, current, voltage, electrodeSeparation, cell, measurements, ...rest } = electrochemistry ?? {};

  return {
    type: convertElectrochemistryTypeToOrd(type),
    current: ordCurrentToReaction(current),
    voltage: ordVoltageToReaction(voltage),
    electrodeSeparation: ordLengthToReaction(electrodeSeparation),
    cell: ordElectrochemistryCellToReaction(cell),
    electrochemistryMeasurements: (measurements || []).map(ordElectrochemistryMeasurementToReaction),
    ...rest,
  };
};

export const reactionElectrochemistryConditionToOrd = ({
  type,
  current,
  voltage,
  electrodeSeparation,
  cell,
  electrochemistryMeasurements,
  ...rest
}: ReactionElectrochemistryCondition): ord.IElectrochemistryConditions => {
  return {
    type: reactionElectrochemistryTypeToOrd(type),
    current: reactionCurrentToOrd(current),
    voltage: reactionVoltageToOrd(voltage),
    electrodeSeparation: reactionLengthToOrd(electrodeSeparation),
    cell: reactionElectrochemistryCellToOrd(cell),
    measurements:
      electrochemistryMeasurements.length > 0
        ? electrochemistryMeasurements.map(reactionElectrochemistryMeasurementToOrd)
        : null,
    ...rest,
  };
};

const ordFlowConditionToReaction = (flow: OrdOptional<ord.IFlowConditions>): ReactionFlowCondition => {
  const { type, tubing, ...rest } = flow ?? {};

  return {
    type: ordFlowTypeToReaction(type),
    tubing: ordTubingToReaction(tubing),
    ...rest,
  };
};

export const reactionFlowConditionToOrd = ({ type, tubing, ...rest }: ReactionFlowCondition): ord.IFlowConditions => {
  return {
    type: reactionFlowTypeToOrd(type),
    tubing: reactionTubingToOrd(tubing),
    ...rest,
  };
};

export const ordConditionsToReactionConditions = (conditions?: ord.IReactionConditions | null): ReactionConditions => {
  const {
    temperature,
    reflux,
    conditionsAreDynamic,
    pressure,
    stirring,
    illumination,
    electrochemistry,
    flow,
    ...rest
  } = conditions ?? (ord.ReactionConditions.toObject(new ord.ReactionConditions()) as ord.IReactionConditions);

  return withId({
    temperature: ordTemperatureConditionToReaction(temperature),
    pressure: ordPressureConditionToReaction(pressure),
    stirring: ordStirringConditionToReaction(stirring),
    illumination: ordIlluminationConditionToReaction(illumination),
    electrochemistry: ordElectrochemistryConditionToReaction(electrochemistry),
    flow: ordFlowConditionToReaction(flow),
    reflux: ordBooleanToReaction(reflux),
    conditionsAreDynamic: ordBooleanToReaction(conditionsAreDynamic),
    ...rest,
  });
};

export const reactionConditionsToOrdConditions = ({
  temperature,
  pressure,
  stirring,
  illumination,
  electrochemistry,
  flow,
  reflux,
  conditionsAreDynamic,
  ...rest
}: ReactionConditions): ord.IReactionConditions => {
  return withoutId({
    temperature: reactionTemperatureConditionToOrd(temperature),
    pressure: reactionPressureConditionToOrd(pressure),
    stirring: reactionStirringConditionToOrd(stirring),
    illumination: reactionIlluminationConditionToOrd(illumination),
    electrochemistry: reactionElectrochemistryConditionToOrd(electrochemistry),
    flow: reactionFlowConditionToOrd(flow),
    reflux: reactionBooleanToOrd(reflux),
    conditionsAreDynamic: reactionBooleanToOrd(conditionsAreDynamic),
    ...rest,
  });
};
