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
  reactionTemperatureToOrd,
  reactionPressureToOrd,
  withId,
  ordWaveLengthToReaction,
  reactionWaveLengthToOrd,
  ordDistanceToReaction,
  reactionDistanceToOrd,
  reactionCurrentToOrd,
  ordCurrentToReaction,
  convertElectrochemistryTypeToOrd,
} from '../reactionEntity/reactionEntity.converters';
import {
  ordAtmosphereTypeToReaction,
  reactionAtmosphereTypeToOrd,
  ordTemperatureControlTypeToReaction,
  reactionTemperatureControlTypeToOrd,
  ordStirringMethodTypeToReaction,
  reactionStirringMethodTypeToOrd,
  ordStirringRateTypeToReaction,
  reactionStirringRateTypeToOrd,
  ordIlluminationTypeToReaction,
  reactionIlluminationTypeToOrd,
  reactionElectrochemistryTypeToOrd,
  ordElectrochemistryCellTypeToReaction,
  reactionElectrochemistryCellTypeToOrd,
  ordFlowTypeToReaction,
  reactionFlowTypeToOrd,
  ordTubingTypeToReaction,
  reactionTubingTypeToOrd,
} from '../reactionEntityTypes/reactionEntityTypes.converters';
import type { ReactionConditions } from './reactionConditions.types';

const ordStirringConditionsToAppStirringConditions = (stirring?: ord.IStirringConditions | null) => {
  const { type, details, rate } = stirring ?? {};
  const { type: rateType, details: rateDetails, rpm } = rate ?? {};

  return {
    stirringMethod: ordStirringMethodTypeToReaction(type),
    stirringDetails: details,
    rate: ordStirringRateTypeToReaction(rateType),
    rateDetails: rateDetails,
    rpm: rpm?.toString(),
  };
};

const ordIlluminationConditionsToAppIlluminationConditions = (illumination?: ord.IIlluminationConditions | null) => {
  const { type, details, peakWavelength, color, distanceToVessel } = illumination ?? {};

  return {
    illuminationType: ordIlluminationTypeToReaction(type),
    illuminationDetails: details,
    peakWavelength: ordWaveLengthToReaction(peakWavelength),
    color: color,
    distanceToVessel: ordDistanceToReaction(distanceToVessel),
  };
};

const ordElectrochemistryConditionsToAppElectrochemistryConditions = (
  electrochemistry?: ord.IElectrochemistryConditions | null,
) => {
  const { type, details, current, anodeMaterial, cathodeMaterial, electrodeSeparation, cell } = electrochemistry ?? {};
  const { type: cellType, details: separationDetails } = cell ?? {};

  return {
    electrochemistryType: convertElectrochemistryTypeToOrd(type),
    electrochemistryDetails: details,
    current: ordCurrentToReaction(current),
    anode: anodeMaterial,
    cathode: cathodeMaterial,
    separation: ordDistanceToReaction(electrodeSeparation),
    cell: ordElectrochemistryCellTypeToReaction(cellType),
    separationDetails: separationDetails,
  };
};

const ordFlowConditionsToAppFlowConditions = (flow?: ord.IFlowConditions | null) => {
  const { type, details, pumpType, tubing } = flow ?? {};
  const { type: tubingType, details: tubingDetails, diameter } = tubing ?? {};

  return {
    flowType: ordFlowTypeToReaction(type),
    flowDetails: details,
    pumpType: pumpType,
    tubing: ordTubingTypeToReaction(tubingType),
    tubingDetails: tubingDetails,
    diameter: ordDistanceToReaction(diameter),
  };
};

const ordTemperatureConditionsToAppTemperatureConditions = (temperature?: ord.ITemperatureConditions | null) => {
  const { setpoint, control } = temperature ?? {};
  const { type: temperatureControlType, details: temperatureControlDetails } = control ?? {};
  return {
    temperature: ordTemperatureToReaction(setpoint),
    temperatureControl: ordTemperatureControlTypeToReaction(temperatureControlType),
    temperatureDetails: temperatureControlDetails,
  };
};

const ordPressureConditionsToAppPressureConditions = (pressure?: ord.IPressureConditions | null) => {
  const { setpoint, atmosphere, control } = pressure ?? {};
  const { type: atmosphereType, details: atmosphereDetails } = atmosphere ?? {};
  const { type: pressureControlType, details: pressureControlDetails } = control ?? {};
  return {
    pressure: ordPressureToReaction(setpoint),
    atmosphere: ordAtmosphereTypeToReaction(atmosphereType),
    atmosphereDetails: atmosphereDetails,
    pressureControl: ordAtmosphereTypeToReaction(pressureControlType),
    pressureControlDetails: pressureControlDetails,
  };
};

const reactionPressureWithAtmosphereToOrd = (conditions: ReactionConditions) => {
  return {
    setpoint: reactionPressureToOrd(conditions.pressure),
    atmosphere: {
      type: reactionAtmosphereTypeToOrd(conditions.atmosphere),
      details: conditions.atmosphereDetails,
    },
    control: {
      details: conditions.pressureControlDetails,
    },
  };
};

export const reactionElectrochemistryToOrd = (conditions: ReactionConditions) => {
  return {
    type: reactionElectrochemistryTypeToOrd(conditions.electrochemistryType),
    details: conditions.electrochemistryDetails,
    current: reactionCurrentToOrd(conditions.current),
    anodeMaterial: conditions.anode,
    cathodeMaterial: conditions.cathode,
    electrodeSeparation: reactionDistanceToOrd(conditions.separation),
    cell: {
      type: reactionElectrochemistryCellTypeToOrd(conditions.cell),
      details: conditions.separationDetails,
    },
  };
};

export const reactionFlowToOrd = (conditions: ReactionConditions) => {
  return {
    type: reactionFlowTypeToOrd(conditions.flowType),
    details: conditions.flowDetails,
    pumpType: conditions.pumpType,
    tubing: {
      type: reactionTubingTypeToOrd(conditions.tubing),
      details: conditions.tubingDetails,
      diameter: reactionDistanceToOrd(conditions.diameter),
    },
  };
};

export const appTemperatureConditionsToOrdTemperatureConditions = (conditions: ReactionConditions) => {
  return {
    setpoint: reactionTemperatureToOrd(conditions.temperature),
    control: {
      type: reactionTemperatureControlTypeToOrd(conditions.temperatureControl),
      details: conditions.temperatureDetails,
    },
  };
};

export const reactionStittingToOrdStirring = (conditions: ReactionConditions) => {
  return {
    type: reactionStirringMethodTypeToOrd(conditions.stirringMethod),
    details: conditions.stirringDetails,
    rate: {
      type: reactionStirringRateTypeToOrd(conditions.rate),
      details: conditions.rateDetails,
      rpm: conditions.rpm ? Number(conditions.rpm) : undefined,
    },
  };
};

export const reactionIlluminationToOrdIllumination = (conditions: ReactionConditions) => {
  return {
    type: reactionIlluminationTypeToOrd(conditions.illuminationType),
    details: conditions.illuminationDetails,
    peakWavelength: reactionWaveLengthToOrd(conditions.peakWavelength),
    color: conditions.color,
    distanceToVessel: reactionDistanceToOrd(conditions.distanceToVessel),
  };
};

export const ordConditionsToReactionConditions = (conditions?: ord.IReactionConditions | null): ReactionConditions => {
  const {
    conditionsAreDynamic,
    reflux,
    temperature,
    pressure,
    stirring,
    illumination,
    electrochemistry,
    details,
    flow,
    ...restProps
  } = conditions ?? ord.ReactionConditions.toObject(new ord.ReactionConditions());

  return withId({
    generalDetails: details,
    reflux: ordBooleanToReaction(reflux),
    conditionsAreDynamic: ordBooleanToReaction(conditionsAreDynamic),

    ...ordTemperatureConditionsToAppTemperatureConditions(temperature),
    ...ordPressureConditionsToAppPressureConditions(pressure),
    ...ordStirringConditionsToAppStirringConditions(stirring),
    ...ordIlluminationConditionsToAppIlluminationConditions(illumination),
    ...ordElectrochemistryConditionsToAppElectrochemistryConditions(electrochemistry),
    ...ordFlowConditionsToAppFlowConditions(flow),

    ...restProps,
  });
};

export const reactionConditionsToOrdConditions = (conditions: ReactionConditions): ord.IReactionConditions => {
  return {
    details: conditions.generalDetails,
    ph: conditions.ph,
    reflux: reactionBooleanToOrd(conditions.reflux),
    conditionsAreDynamic: reactionBooleanToOrd(conditions.conditionsAreDynamic),
    temperature: appTemperatureConditionsToOrdTemperatureConditions(conditions),
    pressure: reactionPressureWithAtmosphereToOrd(conditions),
    stirring: reactionStittingToOrdStirring(conditions),
    illumination: reactionIlluminationToOrdIllumination(conditions),
    electrochemistry: reactionElectrochemistryToOrd(conditions),
    flow: reactionFlowToOrd(conditions),
  };
};
