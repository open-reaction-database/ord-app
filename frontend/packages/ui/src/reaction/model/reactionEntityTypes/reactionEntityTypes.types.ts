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
import type * as ord from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';

export type ReactionRole = keyof typeof ord.ReactionRole_ReactionRoleType;

export type CompoundPreparationType =
  keyof typeof ord.CompoundPreparation_CompoundPreparationType;

export type ReactionTimeType = keyof typeof ord.Time_TimeUnit;

export type ReactionAdditionDeviceType =
  keyof typeof ord.ReactionInput_AdditionDevice_AdditionDeviceType;

export type ReactionSpeedType =
  keyof typeof ord.ReactionInput_AdditionSpeed_AdditionSpeedType;

export type ReactionFlowRateType = keyof typeof ord.FlowRate_FlowRateUnit;

export type ReactionTemperatureType = keyof typeof ord.Temperature_TemperatureUnit;

export type ReactionTemperatureControlType =
  keyof typeof ord.TemperatureConditions_TemperatureControl_TemperatureControlType;

export type ReactionPressureType = keyof typeof ord.Pressure_PressureUnit;

export type ReactionTextureType = keyof typeof ord.Texture_TextureType;

export type ReactionAnalysisType = keyof typeof ord.Analysis_AnalysisType;

export type ReactionIdentifierType =
  keyof typeof ord.ReactionIdentifier_ReactionIdentifierType;

export type ReactionMeasurementType =
  keyof typeof ord.ProductMeasurement_ProductMeasurementType;

export type ReactionSelectivityType =
  keyof typeof ord.ProductMeasurement_Selectivity_SelectivityType;

export type ReactionWaveLengthType = keyof typeof ord.Wavelength_WavelengthUnit;

export type ReactionLengthType = keyof typeof ord.Length_LengthUnit;

export type ReactionCurrentType = keyof typeof ord.Current_CurrentUnit;

export type ReactionMassSpecType =
  keyof typeof ord.ProductMeasurement_MassSpecMeasurementDetails_MassSpecMeasurementType;

export type CompoundIdentifierType =
  keyof typeof ord.CompoundIdentifier_CompoundIdentifierType;

export type ReactionAtmosphereType =
  keyof typeof ord.PressureConditions_Atmosphere_AtmosphereType;

export type ReactionStirringMethodType =
  keyof typeof ord.StirringConditions_StirringMethodType;

export type ReactionIlluminationType =
  keyof typeof ord.IlluminationConditions_IlluminationType;

export type StirringRateType =
  keyof typeof ord.StirringConditions_StirringRate_StirringRateType;

export type ElectrochemistryType =
  keyof typeof ord.ElectrochemistryConditions_ElectrochemistryType;

export type ElectrochemistryCellType =
  keyof typeof ord.ElectrochemistryConditions_ElectrochemistryCell_ElectrochemistryCellType;

export type ReactionFlowType = keyof typeof ord.FlowConditions_FlowType;

export type TubingType = keyof typeof ord.FlowConditions_Tubing_TubingType;

export type WorkupType = keyof typeof ord.ReactionWorkup_ReactionWorkupType;

export type PressureControlType =
  keyof typeof ord.PressureConditions_PressureControl_PressureControlType;

export type VoltageUnit = keyof typeof ord.Voltage_VoltageUnit;

export type TemperatureMeasurementType =
  keyof typeof ord.TemperatureConditions_TemperatureMeasurement_TemperatureMeasurementType;

export type PressureMeasurementType =
  keyof typeof ord.PressureConditions_PressureMeasurement_PressureMeasurementType;

export type ReactionVesselType = keyof typeof ord.Vessel_VesselType;

export type ReactionVesselMaterialType =
  keyof typeof ord.VesselMaterial_VesselMaterialType;

export type ReactionVesselPreparationType =
  keyof typeof ord.VesselPreparation_VesselPreparationType;

export type ReactionVesselAttachmentType =
  keyof typeof ord.VesselAttachment_VesselAttachmentType;

export type ReactionEnvironmentType =
  keyof typeof ord.ReactionSetup_ReactionEnvironment_ReactionEnvironmentType;

export type ReactionVolumeTypeValues = keyof typeof ord.Volume_VolumeUnit;
