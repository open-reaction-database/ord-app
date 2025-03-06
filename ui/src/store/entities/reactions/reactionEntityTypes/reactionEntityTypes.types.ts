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
import type { ord } from 'ord-schema-protobufjs';

export type ReactionRole = keyof typeof ord.ReactionRole.ReactionRoleType;

export type CompoundPreparationType = keyof typeof ord.CompoundPreparation.CompoundPreparationType;

export type ReactionTimeType = keyof typeof ord.Time.TimeUnit;

export type ReactionAdditionDeviceType = keyof typeof ord.ReactionInput.AdditionDevice.AdditionDeviceType;

export type ReactionSpeedType = keyof typeof ord.ReactionInput.AdditionSpeed.AdditionSpeedType;

export type ReactionFlowRateType = keyof typeof ord.FlowRate.FlowRateUnit;

export type ReactionTemperatureType = keyof typeof ord.Temperature.TemperatureUnit;

export type ReactionTextureType = keyof typeof ord.Texture.TextureType;

export type ReactionAnalysisType = keyof typeof ord.Analysis.AnalysisType;

export type ReactionIdentifierType = keyof typeof ord.ReactionIdentifier.ReactionIdentifierType;

export type ReactionMeasurementType = keyof typeof ord.ProductMeasurement.ProductMeasurementType;

export type ReactionSelectivityType = keyof typeof ord.ProductMeasurement.Selectivity.SelectivityType;

export type ReactionWaveLengthType = keyof typeof ord.Wavelength.WavelengthUnit;

export type ReactionMassSpecType =
  keyof typeof ord.ProductMeasurement.MassSpecMeasurementDetails.MassSpecMeasurementType;

export type CompoundIdentifierType = keyof typeof ord.CompoundIdentifier.CompoundIdentifierType;
