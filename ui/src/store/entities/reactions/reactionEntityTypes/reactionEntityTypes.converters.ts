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
  timeTypeByValue,
  reactionIdentifierTypeByValue,
  analysisTypeByValue,
  measurementTypeByValue,
  selectivityTypeByValue,
  waveLengthTypeByValue,
  massSpecTypeByValue,
  compoundIdentifierTypeByValue,
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
  generateEntityTypeToFromOrd(timeTypeByValue, ord.Time.TimeUnit);

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

export const { ordEntityToEntity: ordMassSpecTypeToReaction, entityToOrdEntity: reactionMassSpecTypeToOrd } =
  generateEntityTypeToFromOrd(
    massSpecTypeByValue,
    ord.ProductMeasurement.MassSpecMeasurementDetails.MassSpecMeasurementType,
  );

export const {
  ordEntityToEntity: ordCompoundIdentifierTypeToReaction,
  entityToOrdEntity: reactionCompoundIdentifierTypeToOrd,
} = generateEntityTypeToFromOrd(compoundIdentifierTypeByValue, ord.CompoundIdentifier.CompoundIdentifierType);
