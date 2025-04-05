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
  convertElectrochemistryType,
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

const convertDetails = (details?: string | null): string | null => details ?? null;

const convertStirring = (stirring?: ord.IStirringConditions | null) => {
  const { type, details, rate } = stirring ?? {};
  const { type: rateType, details: rateDetails, rpm } = rate ?? {};

  return {
    stirringMethod: ordStirringMethodTypeToReaction(type),
    stirringDetails: convertDetails(details),
    rate: ordStirringRateTypeToReaction(rateType),
    rateDetails: convertDetails(rateDetails),
    rpm: rpm?.toString() ?? '',
  };
};

const convertIllumination = (illumination?: ord.IIlluminationConditions | null) => {
  const { type, details, peakWavelength, color, distanceToVessel } = illumination ?? {};

  return {
    illuminationType: ordIlluminationTypeToReaction(type),
    illuminationDetails: convertDetails(details),
    peakWavelength: ordWaveLengthToReaction(peakWavelength ?? null),
    color: convertDetails(color),
    distanceToVessel: ordWaveLengthToReaction(distanceToVessel ?? null),
  };
};

const convertElectrochemistry = (electrochemistry?: ord.IElectrochemistryConditions | null) => {
  const { type, details, current, anodeMaterial, cathodeMaterial, electrodeSeparation, cell } = electrochemistry ?? {};
  const { type: cellType, details: separationDetails } = cell ?? {};

  return {
    electrochemistryType: convertElectrochemistryType(type),
    electrochemistryDetails: convertDetails(details),
    current: ordWaveLengthToReaction(current ?? null),
    anode: convertDetails(anodeMaterial),
    cathode: convertDetails(cathodeMaterial),
    separation: ordWaveLengthToReaction(electrodeSeparation ?? null),
    cell: ordElectrochemistryCellTypeToReaction(cellType),
    separationDetails: convertDetails(separationDetails),
  };
};

const convertFlow = (flow?: ord.IFlowConditions | null) => {
  const { type, details, pumpType, tubing } = flow ?? {};
  const { type: tubingType, details: tubingDetails, diameter } = tubing ?? {};

  return {
    flowType: ordFlowTypeToReaction(type),
    flowDetails: convertDetails(details),
    pumpType: convertDetails(pumpType),
    tubing: ordTubingTypeToReaction(tubingType),
    tubingDetails: convertDetails(tubingDetails),
    diameter: ordWaveLengthToReaction(diameter ?? null),
  };
};

const convertTemperature = (temperature?: ord.ITemperatureConditions | null) => {
  const { setpoint, control } = temperature ?? {};
  const { type: temperatureControlType, details: temperatureControlDetails } = control ?? {};
  return {
    temperature: ordTemperatureToReaction(setpoint ?? null),
    temperatureControl: ordTemperatureControlTypeToReaction(temperatureControlType),
    temperatureDetails: convertDetails(temperatureControlDetails),
  };
};

const convertPressure = (pressure?: ord.IPressureConditions | null) => {
  const { setpoint, atmosphere, control: pressureControl } = pressure ?? {};
  const { type: atmosphereType, details: atmosphereDetails } = atmosphere ?? {};
  const { details: pressureControlDetails } = pressureControl ?? {};
  return {
    pressure: ordPressureToReaction(setpoint),
    atmosphere: ordAtmosphereTypeToReaction(atmosphereType),
    atmosphereDetails: convertDetails(atmosphereDetails),
    pressureControlDetails: pressureControlDetails ?? '',
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

const reactionElectrochemistryToOrd = (conditions: ReactionConditions) => {
  return {
    type: reactionElectrochemistryTypeToOrd(conditions.electrochemistryType),
    details: conditions.electrochemistryDetails,
    current: reactionWaveLengthToOrd(conditions.current),
    anodeMaterial: conditions.anode,
    cathodeMaterial: conditions.cathode,
    electrodeSeparation: reactionWaveLengthToOrd(conditions.separation),
    cell: {
      type: reactionElectrochemistryCellTypeToOrd(conditions.cell),
      details: conditions.separationDetails,
    },
  };
};

const reactionFlowToOrd = (conditions: ReactionConditions) => {
  return {
    type: reactionFlowTypeToOrd(conditions.flowType),
    details: conditions.flowDetails,
    pumpType: conditions.pumpType,
    tubing: {
      type: reactionTubingTypeToOrd(conditions.tubing),
      details: conditions.tubingDetails,
      diameter: reactionWaveLengthToOrd(conditions.diameter),
    },
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
    generalDetails: details ?? null,
    reflux: ordBooleanToReaction(reflux),
    conditionsAreDynamic: ordBooleanToReaction(conditionsAreDynamic),

    ...convertTemperature(temperature),
    ...convertPressure(pressure),
    ...convertStirring(stirring),
    ...convertIllumination(illumination),
    ...convertElectrochemistry(electrochemistry),
    ...convertFlow(flow),

    ...restProps,
  });
};

export const reactionConditionsToOrdConditions = (conditions: ReactionConditions): ord.IReactionConditions => {
  return {
    details: conditions.generalDetails,
    ph: conditions.ph,
    reflux: reactionBooleanToOrd(conditions.reflux),
    conditionsAreDynamic: reactionBooleanToOrd(conditions.conditionsAreDynamic),
    temperature: {
      setpoint: reactionTemperatureToOrd(conditions.temperature),
      control: {
        type: reactionTemperatureControlTypeToOrd(conditions.temperatureControl),
        details: conditions.temperatureDetails,
      },
    },
    pressure: reactionPressureWithAtmosphereToOrd(conditions),
    stirring: {
      type: reactionStirringMethodTypeToOrd(conditions.stirringMethod),
      details: conditions.stirringDetails,
      rate: {
        type: reactionStirringRateTypeToOrd(conditions.rate),
        details: conditions.rateDetails,
        rpm: conditions.rpm && conditions.rpm !== '' ? Number(conditions.rpm) : undefined,
      },
    },
    illumination: {
      type: reactionIlluminationTypeToOrd(conditions.illuminationType),
      details: conditions.illuminationDetails,
      peakWavelength: reactionWaveLengthToOrd(conditions.peakWavelength),
      color: conditions.color,
      distanceToVessel: reactionWaveLengthToOrd(conditions.distanceToVessel),
    },
    electrochemistry: reactionElectrochemistryToOrd(conditions),
    flow: reactionFlowToOrd(conditions),
  };
};
