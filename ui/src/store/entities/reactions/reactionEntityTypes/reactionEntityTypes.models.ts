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
import type { DescEnum } from '@bufbuild/protobuf';
import {
  Analysis_AnalysisTypeSchema,
  CompoundIdentifier_CompoundIdentifierTypeSchema,
  CompoundPreparation_CompoundPreparationTypeSchema,
  Current_CurrentUnitSchema,
  ElectrochemistryConditions_ElectrochemistryCell_ElectrochemistryCellTypeSchema,
  ElectrochemistryConditions_ElectrochemistryTypeSchema,
  FlowConditions_FlowTypeSchema,
  FlowConditions_Tubing_TubingTypeSchema,
  FlowRate_FlowRateUnitSchema,
  IlluminationConditions_IlluminationTypeSchema,
  Length_LengthUnitSchema,
  PressureConditions_Atmosphere_AtmosphereTypeSchema,
  PressureConditions_PressureControl_PressureControlTypeSchema,
  PressureConditions_PressureMeasurement_PressureMeasurementTypeSchema,
  Pressure_PressureUnitSchema,
  ProductMeasurement_MassSpecMeasurementDetails_MassSpecMeasurementTypeSchema,
  ProductMeasurement_ProductMeasurementTypeSchema,
  ProductMeasurement_Selectivity_SelectivityTypeSchema,
  ReactionIdentifier_ReactionIdentifierTypeSchema,
  ReactionInput_AdditionDevice_AdditionDeviceTypeSchema,
  ReactionInput_AdditionSpeed_AdditionSpeedTypeSchema,
  ReactionRole_ReactionRoleTypeSchema,
  ReactionSetup_ReactionEnvironment_ReactionEnvironmentTypeSchema,
  ReactionWorkup_ReactionWorkupTypeSchema,
  StirringConditions_StirringMethodTypeSchema,
  StirringConditions_StirringRate_StirringRateTypeSchema,
  TemperatureConditions_TemperatureControl_TemperatureControlTypeSchema,
  TemperatureConditions_TemperatureMeasurement_TemperatureMeasurementTypeSchema,
  Temperature_TemperatureUnitSchema,
  Texture_TextureTypeSchema,
  Time_TimeUnitSchema,
  VesselAttachment_VesselAttachmentTypeSchema,
  VesselMaterial_VesselMaterialTypeSchema,
  VesselPreparation_VesselPreparationTypeSchema,
  Vessel_VesselTypeSchema,
  Voltage_VoltageUnitSchema,
  Volume_VolumeUnitSchema,
  Wavelength_WavelengthUnitSchema,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { reversePrimitiveRecord } from 'common/utils/reversePrimitiveRecord.ts';
import type {
  CompoundIdentifierType,
  CompoundPreparationType,
  ElectrochemistryCellType,
  ElectrochemistryType,
  PressureControlType,
  PressureMeasurementType,
  ReactionAdditionDeviceType,
  ReactionAnalysisType,
  ReactionAtmosphereType,
  ReactionCurrentType,
  ReactionEnvironmentType,
  ReactionFlowRateType,
  ReactionFlowType,
  ReactionIdentifierType,
  ReactionIlluminationType,
  ReactionLengthType,
  ReactionMassSpecType,
  ReactionMeasurementType,
  ReactionPressureType,
  ReactionRole,
  ReactionSelectivityType,
  ReactionSpeedType,
  ReactionStirringMethodType,
  ReactionTemperatureControlType,
  ReactionTemperatureType,
  ReactionTextureType,
  ReactionTimeType,
  ReactionVesselAttachmentType,
  ReactionVesselMaterialType,
  ReactionVesselPreparationType,
  ReactionVesselType,
  ReactionVolumeTypeValues,
  ReactionWaveLengthType,
  StirringRateType,
  TemperatureMeasurementType,
  TubingType,
  VoltageUnit,
  WorkupType,
} from './reactionEntityTypes.types.ts';

// Maps each value name of an enum to its number. Reads the enum descriptor, since the generated
// TypeScript enum object also maps each number back to its name. `T` is the union of the
// generated enum's value names.
export const enumValueByName = <T extends string>(
  schema: DescEnum,
): Record<T, number> =>
  Object.fromEntries(schema.values.map(({ name, number }) => [name, number])) as Record<
    T,
    number
  >;

const generateOptionsAndByValue = <T extends string>(schema: DescEnum) => {
  const valueByName = enumValueByName<T>(schema);
  return {
    options: Object.keys(valueByName),
    byValue: reversePrimitiveRecord<T, number>(valueByName),
  };
};

export const { options: reactionRoleOptions, byValue: reactionRoleByValue } =
  generateOptionsAndByValue<ReactionRole>(ReactionRole_ReactionRoleTypeSchema);

export const { options: preparationTypeOptions, byValue: preparationTypeByValue } =
  generateOptionsAndByValue<CompoundPreparationType>(
    CompoundPreparation_CompoundPreparationTypeSchema,
  );

export const { options: timeUnitOptions, byValue: timeUnitByValue } =
  generateOptionsAndByValue<ReactionTimeType>(Time_TimeUnitSchema);

export const {
  options: additionDeviceTypeOptions,
  byValue: reactionAdditionDeviceByValue,
} = generateOptionsAndByValue<ReactionAdditionDeviceType>(
  ReactionInput_AdditionDevice_AdditionDeviceTypeSchema,
);

export const { options: additionSpeedTypeOptions, byValue: additionSpeedTypeByValue } =
  generateOptionsAndByValue<ReactionSpeedType>(
    ReactionInput_AdditionSpeed_AdditionSpeedTypeSchema,
  );

export const { options: flowRateOptions, byValue: flowRateTypeByValue } =
  generateOptionsAndByValue<ReactionFlowRateType>(FlowRate_FlowRateUnitSchema);

export const { options: temperatureOptions, byValue: temperatureTypeByValue } =
  generateOptionsAndByValue<ReactionTemperatureType>(Temperature_TemperatureUnitSchema);

export const { options: stirringRateOptions, byValue: stirringRateTypeByValue } =
  generateOptionsAndByValue<StirringRateType>(
    StirringConditions_StirringRate_StirringRateTypeSchema,
  );

export const { options: pressureUnitOptions, byValue: pressureByValue } =
  generateOptionsAndByValue<ReactionPressureType>(Pressure_PressureUnitSchema);

export const { options: atmosphereTypeOptions, byValue: atmosphereTypeByValue } =
  generateOptionsAndByValue<ReactionAtmosphereType>(
    PressureConditions_Atmosphere_AtmosphereTypeSchema,
  );

export const {
  options: temperatureControlTypeOptions,
  byValue: temperatureControlTypeByValue,
} = generateOptionsAndByValue<ReactionTemperatureControlType>(
  TemperatureConditions_TemperatureControl_TemperatureControlTypeSchema,
);

export const { options: textureTypeOptions, byValue: textureTypeByValue } =
  generateOptionsAndByValue<ReactionTextureType>(Texture_TextureTypeSchema);

export const { options: analysisOptions, byValue: analysisTypeByValue } =
  generateOptionsAndByValue<ReactionAnalysisType>(Analysis_AnalysisTypeSchema);

export const {
  options: reactionIdentifierTypeOptions,
  byValue: reactionIdentifierTypeByValue,
} = generateOptionsAndByValue<ReactionIdentifierType>(
  ReactionIdentifier_ReactionIdentifierTypeSchema,
);

export const { options: measurementsTypeOptions, byValue: measurementTypeByValue } =
  generateOptionsAndByValue<ReactionMeasurementType>(
    ProductMeasurement_ProductMeasurementTypeSchema,
  );

export const { options: selectivityTypeOptions, byValue: selectivityTypeByValue } =
  generateOptionsAndByValue<ReactionSelectivityType>(
    ProductMeasurement_Selectivity_SelectivityTypeSchema,
  );

export const { options: waveLengthTypeOptions, byValue: waveLengthTypeByValue } =
  generateOptionsAndByValue<ReactionWaveLengthType>(Wavelength_WavelengthUnitSchema);

export const { options: massSpecTypeOptions, byValue: massSpecTypeByValue } =
  generateOptionsAndByValue<ReactionMassSpecType>(
    ProductMeasurement_MassSpecMeasurementDetails_MassSpecMeasurementTypeSchema,
  );

export const {
  options: compoundIdentifierTypeOptions,
  byValue: compoundIdentifierTypeByValue,
} = generateOptionsAndByValue<CompoundIdentifierType>(
  CompoundIdentifier_CompoundIdentifierTypeSchema,
);

export const {
  options: stirringMethodTypeOptions,
  byValue: stirringMethodTypeByValue,
} = generateOptionsAndByValue<ReactionStirringMethodType>(
  StirringConditions_StirringMethodTypeSchema,
);

export const { options: illuminationTypeOptions, byValue: illuminationTypeByValue } =
  generateOptionsAndByValue<ReactionIlluminationType>(
    IlluminationConditions_IlluminationTypeSchema,
  );

export const { options: lengthTypeOptions, byValue: lengthTypeByValue } =
  generateOptionsAndByValue<ReactionLengthType>(Length_LengthUnitSchema);

export const {
  options: electrochemistryTypeOptions,
  byValue: electrochemistryTypeByValue,
} = generateOptionsAndByValue<ElectrochemistryType>(
  ElectrochemistryConditions_ElectrochemistryTypeSchema,
);

export const { options: currentTypeOptions, byValue: currentTypeByValue } =
  generateOptionsAndByValue<ReactionCurrentType>(Current_CurrentUnitSchema);

export const {
  options: electrochemistryCellTypeOptions,
  byValue: electrochemistryCellTypeByValue,
} = generateOptionsAndByValue<ElectrochemistryCellType>(
  ElectrochemistryConditions_ElectrochemistryCell_ElectrochemistryCellTypeSchema,
);

export const { options: flowTypeOptions, byValue: flowTypeByValue } =
  generateOptionsAndByValue<ReactionFlowType>(FlowConditions_FlowTypeSchema);

export const { options: tubingTypeOptions, byValue: tubingTypeByValue } =
  generateOptionsAndByValue<TubingType>(FlowConditions_Tubing_TubingTypeSchema);

export const { options: workupTypeOptions, byValue: workupTypeByValue } =
  generateOptionsAndByValue<WorkupType>(ReactionWorkup_ReactionWorkupTypeSchema);

export const {
  options: temperatureMeasurementTypeOptions,
  byValue: temperatureMeasurementTypeByValue,
} = generateOptionsAndByValue<TemperatureMeasurementType>(
  TemperatureConditions_TemperatureMeasurement_TemperatureMeasurementTypeSchema,
);

export const {
  options: pressureControlTypeOptions,
  byValue: pressureControlTypeByValue,
} = generateOptionsAndByValue<PressureControlType>(
  PressureConditions_PressureControl_PressureControlTypeSchema,
);

export const { options: voltageUnitOptions, byValue: voltageUnitByValue } =
  generateOptionsAndByValue<VoltageUnit>(Voltage_VoltageUnitSchema);

export const {
  options: pressureMeasurementTypeOptions,
  byValue: pressureMeasurementTypeByValue,
} = generateOptionsAndByValue<PressureMeasurementType>(
  PressureConditions_PressureMeasurement_PressureMeasurementTypeSchema,
);

export const { options: vesselTypeOptions, byValue: vesselTypeByValue } =
  generateOptionsAndByValue<ReactionVesselType>(Vessel_VesselTypeSchema);

export const {
  options: vesselMaterialTypeOptions,
  byValue: vesselMaterialTypeByValue,
} = generateOptionsAndByValue<ReactionVesselMaterialType>(
  VesselMaterial_VesselMaterialTypeSchema,
);

export const { options: volumeTypeOptions, byValue: volumeTypeByValue } =
  generateOptionsAndByValue<ReactionVolumeTypeValues>(Volume_VolumeUnitSchema);

export const { options: environmentTypeOptions, byValue: environmentTypeByValue } =
  generateOptionsAndByValue<ReactionEnvironmentType>(
    ReactionSetup_ReactionEnvironment_ReactionEnvironmentTypeSchema,
  );

export const {
  options: vesselPreparationTypeOptions,
  byValue: vesselPreparationTypeByValue,
} = generateOptionsAndByValue<ReactionVesselPreparationType>(
  VesselPreparation_VesselPreparationTypeSchema,
);

export const {
  options: vesselAttachmentTypeOptions,
  byValue: vesselAttachmentTypeByValue,
} = generateOptionsAndByValue<ReactionVesselAttachmentType>(
  VesselAttachment_VesselAttachmentTypeSchema,
);
