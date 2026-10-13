/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { create } from '@bufbuild/protobuf';
import {
  Analysis_AnalysisType,
  CompoundIdentifier_CompoundIdentifierType,
  CompoundPreparation_CompoundPreparationType,
  ElectrochemistryConditions_ElectrochemistryType,
  FlowConditions_FlowType,
  IlluminationConditions_IlluminationType,
  Mass_MassUnit,
  Moles_MolesUnit,
  PressureConditions_Atmosphere_AtmosphereType,
  ProductMeasurement_ProductMeasurementType,
  ReactionIdentifier_ReactionIdentifierType,
  ReactionRole_ReactionRoleType,
  ReactionSchema,
  ReactionWorkup_ReactionWorkupType,
  StirringConditions_StirringMethodType,
  StirringConditions_StirringRate_StirringRateType,
  Temperature_TemperatureUnit,
  Time_TimeUnit,
  Vessel_VesselType,
  VesselMaterial_VesselMaterialType,
  Volume_VolumeUnit,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';

// A reaction that sets, at least once, each field the app reads and writes back.
export const fullReaction = create(ReactionSchema, {
  reactionId: 'ord-0123456789abcdef',
  identifiers: [
    {
      type: ReactionIdentifier_ReactionIdentifierType.REACTION_SMILES,
      value: 'CCO>>CC=O',
      details: 'oxidation',
    },
  ],
  inputs: {
    ethanol: {
      additionOrder: 1,
      additionTime: { value: 5, units: Time_TimeUnit.MINUTE },
      additionSpeed: { type: 2, details: 'dropwise' },
      components: [
        {
          // The app writes MOLBLOCK identifiers first.
          identifiers: [
            {
              type: CompoundIdentifier_CompoundIdentifierType.MOLBLOCK,
              value: 'molblock',
            },
            { type: CompoundIdentifier_CompoundIdentifierType.SMILES, value: 'CCO' },
          ],
          reactionRole: ReactionRole_ReactionRoleType.REACTANT,
          isLimiting: true,
          amount: {
            kind: {
              case: 'volume',
              value: {
                value: 2.5,
                precision: 0.5,
                units: Volume_VolumeUnit.MILLILITER,
              },
            },
            volumeIncludesSolutes: false,
          },
          preparations: [
            {
              type: CompoundPreparation_CompoundPreparationType.SYNTHESIZED,
              details: 'distilled',
              reactionId: 'ord-fedcba9876543210',
            },
          ],
          source: { vendor: 'Sigma', lot: 'L1' },
          features: {
            purity: { kind: { case: 'floatValue', value: 0.5 } },
            count: { kind: { case: 'integerValue', value: 3 } },
            note: { kind: { case: 'stringValue', value: 'dry' }, description: 'notes' },
            image: {
              kind: { case: 'bytesValue', value: new Uint8Array([1, 2, 3]) },
              format: 'png',
            },
            link: { kind: { case: 'url', value: 'https://example.com' } },
          },
          texture: { type: 2, details: 'oil' },
        },
      ],
      crudeComponents: [
        {
          reactionId: 'ord-0000000000000001',
          includesWorkup: true,
          hasDerivedAmount: false,
          amount: {
            kind: { case: 'mass', value: { value: 4, units: Mass_MassUnit.GRAM } },
          },
        },
      ],
    },
  },
  setup: {
    vessel: {
      type: Vessel_VesselType.ROUND_BOTTOM_FLASK,
      details: '50 mL',
      material: { type: VesselMaterial_VesselMaterialType.GLASS },
      volume: { value: 50, units: Volume_VolumeUnit.MILLILITER },
      preparations: [{ type: 2, details: 'oven dried' }],
      attachments: [{ type: 2, details: 'septum' }],
    },
    isAutomated: true,
    automationPlatform: 'robot',
    automationCode: { script: { kind: { case: 'stringValue', value: 'run()' } } },
    environment: { type: 2, details: 'glovebox' },
  },
  conditions: {
    temperature: {
      control: { type: 2, details: 'oil bath' },
      setpoint: { value: 25, units: Temperature_TemperatureUnit.CELSIUS },
      measurements: [
        {
          type: 2,
          details: 'probe',
          time: { value: 1, units: Time_TimeUnit.HOUR },
          temperature: { value: 26, units: Temperature_TemperatureUnit.CELSIUS },
        },
      ],
    },
    pressure: {
      atmosphere: { type: PressureConditions_Atmosphere_AtmosphereType.NITROGEN },
      measurements: [
        {
          type: 2,
          details: 'gauge',
          time: { value: 2, units: Time_TimeUnit.HOUR },
          pressure: { value: 1, units: 1 },
        },
      ],
    },
    stirring: {
      type: StirringConditions_StirringMethodType.STIR_BAR,
      details: 'vigorous',
      rate: {
        type: StirringConditions_StirringRate_StirringRateType.HIGH,
        rpm: 800,
      },
    },
    illumination: {
      type: IlluminationConditions_IlluminationType.LED,
      color: 'blue',
      peakWavelength: { value: 450, units: 1 },
    },
    electrochemistry: {
      type: ElectrochemistryConditions_ElectrochemistryType.CONSTANT_CURRENT,
      anodeMaterial: 'carbon',
      cathodeMaterial: 'platinum',
      current: { value: 10, units: 1 },
      measurements: [
        {
          time: { value: 5, units: Time_TimeUnit.MINUTE },
          current: { value: 9, units: 1 },
          voltage: { value: 3, units: 1 },
        },
      ],
    },
    flow: {
      type: FlowConditions_FlowType.PLUG_FLOW_REACTOR,
      pumpType: 'syringe',
      tubing: { type: 2, details: 'PTFE', diameter: { value: 1, units: 1 } },
    },
    reflux: false,
    ph: 7,
    conditionsAreDynamic: true,
    details: 'room temperature',
  },
  notes: {
    isHeterogeneous: true,
    isExothermic: false,
    safetyNotes: 'flammable',
    procedureDetails: 'stir overnight',
  },
  observations: [
    {
      time: { value: 30, units: Time_TimeUnit.MINUTE },
      comment: 'turned yellow',
      image: { kind: { case: 'url', value: 'https://example.com/image.png' } },
    },
  ],
  workups: [
    {
      type: ReactionWorkup_ReactionWorkupType.CUSTOM,
      details: 'quench',
      keepPhase: 'organic',
      targetPh: 7,
      isAutomated: false,
      duration: { value: 10, units: Time_TimeUnit.MINUTE },
      input: {
        components: [
          {
            identifiers: [
              { type: CompoundIdentifier_CompoundIdentifierType.SMILES, value: 'O' },
            ],
            reactionRole: ReactionRole_ReactionRoleType.WORKUP,
            amount: {
              kind: {
                case: 'volume',
                value: { value: 5, units: Volume_VolumeUnit.MILLILITER },
              },
            },
          },
        ],
      },
    },
  ],
  outcomes: [
    {
      reactionTime: { value: 12, units: Time_TimeUnit.HOUR },
      conversion: { value: 95 },
      analyses: {
        nmr: {
          type: Analysis_AnalysisType.NMR_1H,
          details: 'CDCl3',
          chmoId: 1234,
          isOfIsolatedSpecies: true,
          instrumentManufacturer: 'Bruker',
          instrumentLastCalibrated: { value: '2024-01-01' },
          data: {
            spectrum: { kind: { case: 'url', value: 'https://example.com/nmr' } },
          },
        },
      },
      products: [
        {
          identifiers: [
            { type: CompoundIdentifier_CompoundIdentifierType.SMILES, value: 'CC=O' },
          ],
          isDesiredProduct: true,
          isolatedColor: 'colorless',
          reactionRole: ReactionRole_ReactionRoleType.PRODUCT,
          measurements: [
            {
              analysisKey: 'nmr',
              type: ProductMeasurement_ProductMeasurementType.YIELD,
              details: 'isolated',
              value: { case: 'percentage', value: { value: 85, precision: 2 } },
            },
            {
              type: ProductMeasurement_ProductMeasurementType.CUSTOM,
              usesInternalStandard: true,
              isNormalized: false,
              retentionTime: { value: 3.5, units: Time_TimeUnit.MINUTE },
              massSpecDetails: { type: 2, details: 'ESI', eicMasses: [44, 45.5] },
              selectivity: { type: 2, details: 'ee' },
              wavelength: { value: 254, units: 1 },
              value: { case: 'floatValue', value: { value: 1.5 } },
            },
            {
              type: ProductMeasurement_ProductMeasurementType.SELECTIVITY,
              value: { case: 'stringValue', value: '2:1' },
            },
            {
              type: ProductMeasurement_ProductMeasurementType.AMOUNT,
              usesAuthenticStandard: true,
              authenticStandard: {
                identifiers: [
                  {
                    type: CompoundIdentifier_CompoundIdentifierType.SMILES,
                    value: 'CC=O',
                  },
                ],
                reactionRole: ReactionRole_ReactionRoleType.AUTHENTIC_STANDARD,
              },
              value: {
                case: 'amount',
                value: {
                  kind: {
                    case: 'moles',
                    value: { value: 0.25, units: Moles_MolesUnit.MILLIMOLE },
                  },
                },
              },
            },
          ],
        },
      ],
    },
  ],
  provenance: {
    experimenter: { name: 'Ada Lovelace', orcid: '0000-0000-0000-0000' },
    city: 'London',
    experimentStart: { value: '2024-06-01T12:00:00' },
    doi: '10.1000/xyz',
    publicationUrl: 'https://example.com/paper',
    recordCreated: {
      time: { value: '2024-06-02T12:00:00' },
      person: { username: 'ada', email: 'ada@example.com' },
      details: 'created',
    },
    recordModified: [
      { time: { value: '2024-06-03T12:00:00' }, person: { name: 'Grace Hopper' } },
    ],
    reactionMetadata: {
      origin: { kind: { case: 'stringValue', value: 'notebook' } },
      scan: {
        kind: { case: 'bytesValue', value: new Uint8Array([4, 5]) },
        format: 'raw',
      },
    },
    isMined: false,
  },
});
