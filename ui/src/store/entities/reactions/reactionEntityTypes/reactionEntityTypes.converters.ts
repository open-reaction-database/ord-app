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
import { ord } from 'ord-schema-protobufjs';

const generateEntityTypeToFromOrd = <T extends string>(
  entityTypeByValue: Record<number, T>,
  entityValueByType: Record<T, number>,
) => ({
  ordEntityToEntity: (entityType: undefined | null | number): T => {
    if (entityType === undefined || entityType === null) {
      return entityTypeByValue[0];
    }
    return entityTypeByValue[entityType];
  },
  entityToOrdEntity: (entityType: T): undefined | null | number => {
    return entityValueByType[entityType];
  },
});

export const { ordEntityToEntity: ordPreparationTypeToReaction, entityToOrdEntity: reactionPreparationTypeToOrd } =
  generateEntityTypeToFromOrd(preparationTypeByValue, ord.CompoundPreparation.CompoundPreparationType);

export const { ordEntityToEntity: ordReactionRoleToReaction, entityToOrdEntity: reactionReactionRoleToOrd } =
  generateEntityTypeToFromOrd(reactionRoleByValue, ord.ReactionRole.ReactionRoleType);

export const { ordEntityToEntity: ordTimeTypeToReaction, entityToOrdEntity: reactionTimeTypeToOrd } =
  generateEntityTypeToFromOrd(timeUnitByValue, ord.Time.TimeUnit);

export const {
  ordEntityToEntity: ordAdditionDeviceTypeToReaction,
  entityToOrdEntity: reactionAdditionDeviceTypeToOrd,
} = generateEntityTypeToFromOrd(reactionAdditionDeviceByValue, ord.ReactionInput.AdditionDevice.AdditionDeviceType);

export const { ordEntityToEntity: ordAdditionSpeedTypeToReaction, entityToOrdEntity: reactionAdditionSpeedTypeToOrd } =
  generateEntityTypeToFromOrd(additionSpeedTypeByValue, ord.ReactionInput.AdditionSpeed.AdditionSpeedType);

export const { ordEntityToEntity: ordFlowRateTypeToReaction, entityToOrdEntity: reactionFlowRateTypeToOrd } =
  generateEntityTypeToFromOrd(flowRateTypeByValue, ord.FlowRate.FlowRateUnit);

export const { ordEntityToEntity: ordTemperatureTypeToReaction, entityToOrdEntity: reactionTemperatureTypeToOrd } =
  generateEntityTypeToFromOrd(temperatureTypeByValue, ord.Temperature.TemperatureUnit);

export const { ordEntityToEntity: ordTextureTypeToReaction, entityToOrdEntity: reactionTextureTypeToOrd } =
  generateEntityTypeToFromOrd(textureTypeByValue, ord.Texture.TextureType);

export const {
  ordEntityToEntity: ordReactionIdentifierTypeToReaction,
  entityToOrdEntity: reactionIdentifierTypeToOrd,
} = generateEntityTypeToFromOrd(reactionIdentifierTypeByValue, ord.ReactionIdentifier.ReactionIdentifierType);

export const { ordEntityToEntity: ordAnalysisTypeToReaction, entityToOrdEntity: reactionAnalysisTypeToOrd } =
  generateEntityTypeToFromOrd(analysisTypeByValue, ord.Analysis.AnalysisType);

export const { ordEntityToEntity: ordMeasurementTypeToReaction, entityToOrdEntity: reactionMeasurementTypeToOrd } =
  generateEntityTypeToFromOrd(measurementTypeByValue, ord.ProductMeasurement.ProductMeasurementType);

export const { ordEntityToEntity: ordSelectivityTypeToReaction, entityToOrdEntity: reactionSelectivityTypeToOrd } =
  generateEntityTypeToFromOrd(selectivityTypeByValue, ord.ProductMeasurement.Selectivity.SelectivityType);

export const { ordEntityToEntity: ordWaveLengthTypeToReaction, entityToOrdEntity: reactionWaveLengthTypeToOrd } =
  generateEntityTypeToFromOrd(waveLengthTypeByValue, ord.Wavelength.WavelengthUnit);

export const { ordEntityToEntity: ordLengthTypeToReaction, entityToOrdEntity: reactionLengthTypeToOrd } =
  generateEntityTypeToFromOrd(lengthTypeByValue, ord.Length.LengthUnit);

export const { ordEntityToEntity: ordMassSpecTypeToReaction, entityToOrdEntity: reactionMassSpecTypeToOrd } =
  generateEntityTypeToFromOrd(
    massSpecTypeByValue,
    ord.ProductMeasurement.MassSpecMeasurementDetails.MassSpecMeasurementType,
  );
export const { ordEntityToEntity: ordPressureTypeToReaction, entityToOrdEntity: reactionPressureTypeToOrd } =
  generateEntityTypeToFromOrd(pressureByValue, ord.Pressure.PressureUnit);

export const {
  ordEntityToEntity: ordCompoundIdentifierTypeToReaction,
  entityToOrdEntity: reactionCompoundIdentifierTypeToOrd,
} = generateEntityTypeToFromOrd(compoundIdentifierTypeByValue, ord.CompoundIdentifier.CompoundIdentifierType);

export const { ordEntityToEntity: ordWorkupTypeToReaction, entityToOrdEntity: reactionWorkupTypeToOrd } =
  generateEntityTypeToFromOrd(workupTypeByValue, ord.ReactionWorkup.ReactionWorkupType);

export const { ordEntityToEntity: ordAtmosphereTypeToReaction, entityToOrdEntity: reactionAtmosphereTypeToOrd } =
  generateEntityTypeToFromOrd(atmosphereTypeByValue, ord.PressureConditions.Atmosphere.AtmosphereType);

export const {
  ordEntityToEntity: ordTemperatureControlTypeToReaction,
  entityToOrdEntity: reactionTemperatureControlTypeToOrd,
} = generateEntityTypeToFromOrd(
  temperatureControlTypeByValue,
  ord.TemperatureConditions.TemperatureControl.TemperatureControlType,
);

export const {
  ordEntityToEntity: ordStirringMethodTypeToReaction,
  entityToOrdEntity: reactionStirringMethodTypeToOrd,
} = generateEntityTypeToFromOrd(stirringMethodTypeByValue, ord.StirringConditions.StirringMethodType);

export const { ordEntityToEntity: ordIlluminationTypeToReaction, entityToOrdEntity: reactionIlluminationTypeToOrd } =
  generateEntityTypeToFromOrd(illuminationTypeByValue, ord.IlluminationConditions.IlluminationType);

export const { ordEntityToEntity: ordStirringRateTypeToReaction, entityToOrdEntity: reactionStirringRateTypeToOrd } =
  generateEntityTypeToFromOrd(stirringRateTypeByValue, ord.StirringConditions.StirringRate.StirringRateType);

export const {
  ordEntityToEntity: ordElectrochemistryTypeToReaction,
  entityToOrdEntity: reactionElectrochemistryTypeToOrd,
} = generateEntityTypeToFromOrd(electrochemistryTypeByValue, ord.ElectrochemistryConditions.ElectrochemistryType);

export const {
  ordEntityToEntity: ordElectrochemistryCellTypeToReaction,
  entityToOrdEntity: reactionElectrochemistryCellTypeToOrd,
} = generateEntityTypeToFromOrd(
  electrochemistryCellTypeByValue,
  ord.ElectrochemistryConditions.ElectrochemistryCell.ElectrochemistryCellType,
);

export const { ordEntityToEntity: ordFlowTypeToReaction, entityToOrdEntity: reactionFlowTypeToOrd } =
  generateEntityTypeToFromOrd(flowTypeByValue, ord.FlowConditions.FlowType);

export const { ordEntityToEntity: ordTubingTypeToReaction, entityToOrdEntity: reactionTubingTypeToOrd } =
  generateEntityTypeToFromOrd(tubingTypeByValue, ord.FlowConditions.Tubing.TubingType);

export const { ordEntityToEntity: ordCurrentTypeToReaction, entityToOrdEntity: reactionCurrentTypeToOrd } =
  generateEntityTypeToFromOrd(currentTypeByValue, ord.Current.CurrentUnit);

export const {
  ordEntityToEntity: ordTemperatureMeasurementTypeToReaction,
  entityToOrdEntity: reactionTemperatureMeasurementTypeToOrd,
} = generateEntityTypeToFromOrd(
  temperatureMeasurementTypeByValue,
  ord.TemperatureConditions.TemperatureMeasurement.TemperatureMeasurementType,
);

export const {
  ordEntityToEntity: ordPressureControlTypeToReaction,
  entityToOrdEntity: reactionPressureControlTypeToOrd,
} = generateEntityTypeToFromOrd(pressureControlTypeByValue, ord.PressureConditions.PressureControl.PressureControlType);

export const { ordEntityToEntity: ordVoltageUnitToReaction, entityToOrdEntity: reactionVoltageUnitToOrd } =
  generateEntityTypeToFromOrd(voltageUnitByValue, ord.Voltage.VoltageUnit);

export const {
  ordEntityToEntity: ordPressureMeasurementTypeToReaction,
  entityToOrdEntity: reactionPressureMeasurementTypeToOrd,
} = generateEntityTypeToFromOrd(
  pressureMeasurementTypeByValue,
  ord.PressureConditions.PressureMeasurement.PressureMeasurementType,
);

export const { ordEntityToEntity: ordVesselTypeToReaction, entityToOrdEntity: reactionVesselTypeToOrd } =
  generateEntityTypeToFromOrd(vesselTypeByValue, ord.Vessel.VesselType);

export const { ordEntityToEntity: ordMaterialTypeToReaction, entityToOrdEntity: reactionMaterialTypeToOrd } =
  generateEntityTypeToFromOrd(vesselMaterialTypeByValue, ord.VesselMaterial.VesselMaterialType);

export const { ordEntityToEntity: ordEnvironmentTypeToReaction, entityToOrdEntity: reactionEnvitonmentTypeToOrd } =
  generateEntityTypeToFromOrd(environmentTypeByValue, ord.ReactionSetup.ReactionEnvironment.ReactionEnvironmentType);

export const { ordEntityToEntity: ordVolumeTypeToReaction, entityToOrdEntity: reactionVolumeTypeToOrd } =
  generateEntityTypeToFromOrd(volumeTypeByValue, ord.Volume.VolumeUnit);

export const {
  ordEntityToEntity: ordVesselAttachmentTypeToReaction,
  entityToOrdEntity: reactionVesselAttachmentTypeToOrd,
} = generateEntityTypeToFromOrd(vesselAttachmentTypeByValue, ord.VesselAttachment.VesselAttachmentType);

export const {
  ordEntityToEntity: ordVesselPreparationsTypeToReaction,
  entityToOrdEntity: reactionVesselPreparationsTypeToOrd,
} = generateEntityTypeToFromOrd(vesselPreparationTypeByValue, ord.VesselPreparation.VesselPreparationType);
