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
import type { WorkupType } from '../reactionEntityTypes/reactionEntityTypes.types.ts';
import { workupTypeOptions } from '../reactionEntityTypes/reactionEntityTypes.models.ts';

export namespace WorkupConstants {
  const durationUnCompatibleTypes: Array<WorkupType> = ['UNSPECIFIED', 'ALIQUOT'];

  export const durationCompatibleTypes = workupTypeOptions.filter(
    item => !durationUnCompatibleTypes.includes(item as WorkupType),
  ) as Array<WorkupType>;

  export const aliquotCompatibleTypes: Array<WorkupType> = ['ALIQUOT', 'CUSTOM'];

  export const keepPhaseCompatibleTypes: Array<WorkupType> = ['EXTRACTION', 'FILTRATION', 'CUSTOM'];

  export const targetPhCompatibleTypes: Array<WorkupType> = ['PH_ADJUST', 'ADDITION', 'CUSTOM'];

  export const inputCompatibleTypes: Array<WorkupType> = [
    'SCAVENGING',
    'WASH',
    'DISSOLUTION',
    'PH_ADJUST',
    'ADDITION',
    'DRY_WITH_MATERIAL',
    'CUSTOM',
  ];

  export const temperatureCompatibleTypes: Array<WorkupType> = [
    'DRY_IN_VACUUM',
    'DISTILLATION',
    'TEMPERATURE',
    'DRY_WITH_MATERIAL',
    'CUSTOM',
  ];

  const stirringUnCompatibleTypes: Array<WorkupType> = [
    'UNSPECIFIED',
    'FLASH_CHROMATOGRAPHY',
    'OTHER_CHROMATOGRAPHY',
    'WAIT',
    'ALIQUOT',
  ];

  export const stirringCompatibleTypes = workupTypeOptions.filter(
    item => !stirringUnCompatibleTypes.includes(item as WorkupType),
  ) as Array<WorkupType>;
}
