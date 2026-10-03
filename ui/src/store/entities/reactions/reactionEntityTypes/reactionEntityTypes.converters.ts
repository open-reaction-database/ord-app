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
import {
  preparationTypeByValue,
  reactionAdditionDeviceByValue,
  flowRateTypeByValue,
  reactionRoleByValue,
  additionSpeedTypeByValue,
  temperatureTypeByValue,
  textureTypeByValue,
  timeUnitByValue,
  reactionIdentifierTypeByValue,
  analysisTypeByValue,
  measurementTypeByValue,
  selectivityTypeByValue,
  waveLengthTypeByValue,
  massSpecTypeByValue,
  compoundIdentifierTypeByValue,
  pressureByValue,
  atmosphereTypeByValue,
  temperatureControlTypeByValue,
  stirringMethodTypeByValue,
  illuminationTypeByValue,
  stirringRateTypeByValue,
  electrochemistryTypeByValue,
  electrochemistryCellTypeByValue,
  flowTypeByValue,
  tubingTypeByValue,
  lengthTypeByValue,
  currentTypeByValue,
  workupTypeByValue,
  temperatureMeasurementTypeByValue,
  pressureControlTypeByValue,
  voltageUnitByValue,
  pressureMeasurementTypeByValue,
  vesselTypeByValue,
  vesselMaterialTypeByValue,
  environmentTypeByValue,
  volumeTypeByValue,
  vesselAttachmentTypeByValue,
  vesselPreparationTypeByValue,
} from './reactionEntityTypes.models.ts';
import {
  Analysis_AnalysisType,
  CompoundIdentifier_CompoundIdentifierType,
  CompoundPreparation_CompoundPreparationType,
  Current_CurrentUnit,
  ElectrochemistryConditions_ElectrochemistryCell_ElectrochemistryCellType,
  ElectrochemistryConditions_ElectrochemistryType,
  FlowConditions_FlowType,
  FlowConditions_Tubing_TubingType,
  FlowRate_FlowRateUnit,
  IlluminationConditions_IlluminationType,
  Length_LengthUnit,
  PressureConditions_Atmosphere_AtmosphereType,
  PressureConditions_PressureControl_PressureControlType,
  PressureConditions_PressureMeasurement_PressureMeasurementType,
  Pressure_PressureUnit,
  ProductMeasurement_MassSpecMeasurementDetails_MassSpecMeasurementType,
  ProductMeasurement_ProductMeasurementType,
  ProductMeasurement_Selectivity_SelectivityType,
  ReactionIdentifier_ReactionIdentifierType,
  ReactionInput_AdditionDevice_AdditionDeviceType,
  ReactionInput_AdditionSpeed_AdditionSpeedType,
  ReactionRole_ReactionRoleType,
  ReactionSetup_ReactionEnvironment_ReactionEnvironmentType,
  ReactionWorkup_ReactionWorkupType,
  StirringConditions_StirringMethodType,
  StirringConditions_StirringRate_StirringRateType,
  TemperatureConditions_TemperatureControl_TemperatureControlType,
  TemperatureConditions_TemperatureMeasurement_TemperatureMeasurementType,
  Temperature_TemperatureUnit,
  Texture_TextureType,
  Time_TimeUnit,
  VesselAttachment_VesselAttachmentType,
  VesselMaterial_VesselMaterialType,
  VesselPreparation_VesselPreparationType,
  Vessel_VesselType,
  Voltage_VoltageUnit,
  Volume_VolumeUnit,
  Wavelength_WavelengthUnit,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import type { OrdOptional } from '../reactionEntity/reactionEntity.types.ts';

const generateEntityTypeToFromOrd = <T extends string, E extends number>(
  entityTypeByValue: Record<number, T>,
  entityValueByType: Record<T, E>,
) => ({
  ordEntityToEntity: (entityType: OrdOptional<number>): T => {
    if (entityType === undefined || entityType === null) {
      return entityTypeByValue[0];
    }
    return entityTypeByValue[entityType];
  },
  entityToOrdEntity: (entityType: T): E => {
    return entityValueByType[entityType];
  },
});

export const {
  ordEntityToEntity: ordPreparationTypeToReaction,
  entityToOrdEntity: reactionPreparationTypeToOrd,
} = generateEntityTypeToFromOrd(
  preparationTypeByValue,
  CompoundPreparation_CompoundPreparationType,
);

export const {
  ordEntityToEntity: ordReactionRoleToReaction,
  entityToOrdEntity: reactionReactionRoleToOrd,
} = generateEntityTypeToFromOrd(reactionRoleByValue, ReactionRole_ReactionRoleType);

export const {
  ordEntityToEntity: ordTimeTypeToReaction,
  entityToOrdEntity: reactionTimeTypeToOrd,
} = generateEntityTypeToFromOrd(timeUnitByValue, Time_TimeUnit);

export const {
  ordEntityToEntity: ordAdditionDeviceTypeToReaction,
  entityToOrdEntity: reactionAdditionDeviceTypeToOrd,
} = generateEntityTypeToFromOrd(
  reactionAdditionDeviceByValue,
  ReactionInput_AdditionDevice_AdditionDeviceType,
);

export const {
  ordEntityToEntity: ordAdditionSpeedTypeToReaction,
  entityToOrdEntity: reactionAdditionSpeedTypeToOrd,
} = generateEntityTypeToFromOrd(
  additionSpeedTypeByValue,
  ReactionInput_AdditionSpeed_AdditionSpeedType,
);

export const {
  ordEntityToEntity: ordFlowRateTypeToReaction,
  entityToOrdEntity: reactionFlowRateTypeToOrd,
} = generateEntityTypeToFromOrd(flowRateTypeByValue, FlowRate_FlowRateUnit);

export const {
  ordEntityToEntity: ordTemperatureTypeToReaction,
  entityToOrdEntity: reactionTemperatureTypeToOrd,
} = generateEntityTypeToFromOrd(temperatureTypeByValue, Temperature_TemperatureUnit);

export const {
  ordEntityToEntity: ordTextureTypeToReaction,
  entityToOrdEntity: reactionTextureTypeToOrd,
} = generateEntityTypeToFromOrd(textureTypeByValue, Texture_TextureType);

export const {
  ordEntityToEntity: ordReactionIdentifierTypeToReaction,
  entityToOrdEntity: reactionIdentifierTypeToOrd,
} = generateEntityTypeToFromOrd(
  reactionIdentifierTypeByValue,
  ReactionIdentifier_ReactionIdentifierType,
);

export const {
  ordEntityToEntity: ordAnalysisTypeToReaction,
  entityToOrdEntity: reactionAnalysisTypeToOrd,
} = generateEntityTypeToFromOrd(analysisTypeByValue, Analysis_AnalysisType);

export const {
  ordEntityToEntity: ordMeasurementTypeToReaction,
  entityToOrdEntity: reactionMeasurementTypeToOrd,
} = generateEntityTypeToFromOrd(
  measurementTypeByValue,
  ProductMeasurement_ProductMeasurementType,
);

export const {
  ordEntityToEntity: ordSelectivityTypeToReaction,
  entityToOrdEntity: reactionSelectivityTypeToOrd,
} = generateEntityTypeToFromOrd(
  selectivityTypeByValue,
  ProductMeasurement_Selectivity_SelectivityType,
);

export const {
  ordEntityToEntity: ordWaveLengthTypeToReaction,
  entityToOrdEntity: reactionWaveLengthTypeToOrd,
} = generateEntityTypeToFromOrd(waveLengthTypeByValue, Wavelength_WavelengthUnit);

export const {
  ordEntityToEntity: ordLengthTypeToReaction,
  entityToOrdEntity: reactionLengthTypeToOrd,
} = generateEntityTypeToFromOrd(lengthTypeByValue, Length_LengthUnit);

export const {
  ordEntityToEntity: ordMassSpecTypeToReaction,
  entityToOrdEntity: reactionMassSpecTypeToOrd,
} = generateEntityTypeToFromOrd(
  massSpecTypeByValue,
  ProductMeasurement_MassSpecMeasurementDetails_MassSpecMeasurementType,
);
export const {
  ordEntityToEntity: ordPressureTypeToReaction,
  entityToOrdEntity: reactionPressureTypeToOrd,
} = generateEntityTypeToFromOrd(pressureByValue, Pressure_PressureUnit);

export const {
  ordEntityToEntity: ordCompoundIdentifierTypeToReaction,
  entityToOrdEntity: reactionCompoundIdentifierTypeToOrd,
} = generateEntityTypeToFromOrd(
  compoundIdentifierTypeByValue,
  CompoundIdentifier_CompoundIdentifierType,
);

export const {
  ordEntityToEntity: ordWorkupTypeToReaction,
  entityToOrdEntity: reactionWorkupTypeToOrd,
} = generateEntityTypeToFromOrd(workupTypeByValue, ReactionWorkup_ReactionWorkupType);

export const {
  ordEntityToEntity: ordAtmosphereTypeToReaction,
  entityToOrdEntity: reactionAtmosphereTypeToOrd,
} = generateEntityTypeToFromOrd(
  atmosphereTypeByValue,
  PressureConditions_Atmosphere_AtmosphereType,
);

export const {
  ordEntityToEntity: ordTemperatureControlTypeToReaction,
  entityToOrdEntity: reactionTemperatureControlTypeToOrd,
} = generateEntityTypeToFromOrd(
  temperatureControlTypeByValue,
  TemperatureConditions_TemperatureControl_TemperatureControlType,
);

export const {
  ordEntityToEntity: ordStirringMethodTypeToReaction,
  entityToOrdEntity: reactionStirringMethodTypeToOrd,
} = generateEntityTypeToFromOrd(
  stirringMethodTypeByValue,
  StirringConditions_StirringMethodType,
);

export const {
  ordEntityToEntity: ordIlluminationTypeToReaction,
  entityToOrdEntity: reactionIlluminationTypeToOrd,
} = generateEntityTypeToFromOrd(
  illuminationTypeByValue,
  IlluminationConditions_IlluminationType,
);

export const {
  ordEntityToEntity: ordStirringRateTypeToReaction,
  entityToOrdEntity: reactionStirringRateTypeToOrd,
} = generateEntityTypeToFromOrd(
  stirringRateTypeByValue,
  StirringConditions_StirringRate_StirringRateType,
);

export const {
  ordEntityToEntity: ordElectrochemistryTypeToReaction,
  entityToOrdEntity: reactionElectrochemistryTypeToOrd,
} = generateEntityTypeToFromOrd(
  electrochemistryTypeByValue,
  ElectrochemistryConditions_ElectrochemistryType,
);

export const {
  ordEntityToEntity: ordElectrochemistryCellTypeToReaction,
  entityToOrdEntity: reactionElectrochemistryCellTypeToOrd,
} = generateEntityTypeToFromOrd(
  electrochemistryCellTypeByValue,
  ElectrochemistryConditions_ElectrochemistryCell_ElectrochemistryCellType,
);

export const {
  ordEntityToEntity: ordFlowTypeToReaction,
  entityToOrdEntity: reactionFlowTypeToOrd,
} = generateEntityTypeToFromOrd(flowTypeByValue, FlowConditions_FlowType);

export const {
  ordEntityToEntity: ordTubingTypeToReaction,
  entityToOrdEntity: reactionTubingTypeToOrd,
} = generateEntityTypeToFromOrd(tubingTypeByValue, FlowConditions_Tubing_TubingType);

export const {
  ordEntityToEntity: ordCurrentTypeToReaction,
  entityToOrdEntity: reactionCurrentTypeToOrd,
} = generateEntityTypeToFromOrd(currentTypeByValue, Current_CurrentUnit);

export const {
  ordEntityToEntity: ordTemperatureMeasurementTypeToReaction,
  entityToOrdEntity: reactionTemperatureMeasurementTypeToOrd,
} = generateEntityTypeToFromOrd(
  temperatureMeasurementTypeByValue,
  TemperatureConditions_TemperatureMeasurement_TemperatureMeasurementType,
);

export const {
  ordEntityToEntity: ordPressureControlTypeToReaction,
  entityToOrdEntity: reactionPressureControlTypeToOrd,
} = generateEntityTypeToFromOrd(
  pressureControlTypeByValue,
  PressureConditions_PressureControl_PressureControlType,
);

export const {
  ordEntityToEntity: ordVoltageUnitToReaction,
  entityToOrdEntity: reactionVoltageUnitToOrd,
} = generateEntityTypeToFromOrd(voltageUnitByValue, Voltage_VoltageUnit);

export const {
  ordEntityToEntity: ordPressureMeasurementTypeToReaction,
  entityToOrdEntity: reactionPressureMeasurementTypeToOrd,
} = generateEntityTypeToFromOrd(
  pressureMeasurementTypeByValue,
  PressureConditions_PressureMeasurement_PressureMeasurementType,
);

export const {
  ordEntityToEntity: ordVesselTypeToReaction,
  entityToOrdEntity: reactionVesselTypeToOrd,
} = generateEntityTypeToFromOrd(vesselTypeByValue, Vessel_VesselType);

export const {
  ordEntityToEntity: ordVesselMaterialTypeToReaction,
  entityToOrdEntity: reactionVesselMaterialTypeToOrd,
} = generateEntityTypeToFromOrd(
  vesselMaterialTypeByValue,
  VesselMaterial_VesselMaterialType,
);

export const {
  ordEntityToEntity: ordEnvironmentTypeToReaction,
  entityToOrdEntity: reactionEnvironmentTypeToOrd,
} = generateEntityTypeToFromOrd(
  environmentTypeByValue,
  ReactionSetup_ReactionEnvironment_ReactionEnvironmentType,
);

export const {
  ordEntityToEntity: ordVolumeTypeToReaction,
  entityToOrdEntity: reactionVolumeTypeToOrd,
} = generateEntityTypeToFromOrd(volumeTypeByValue, Volume_VolumeUnit);

export const {
  ordEntityToEntity: ordVesselAttachmentTypeToReaction,
  entityToOrdEntity: reactionVesselAttachmentTypeToOrd,
} = generateEntityTypeToFromOrd(
  vesselAttachmentTypeByValue,
  VesselAttachment_VesselAttachmentType,
);

export const {
  ordEntityToEntity: ordVesselPreparationsTypeToReaction,
  entityToOrdEntity: reactionVesselPreparationsTypeToOrd,
} = generateEntityTypeToFromOrd(
  vesselPreparationTypeByValue,
  VesselPreparation_VesselPreparationType,
);
