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
import type { AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import type {
  ReactionBoolean,
  ReactionTime,
  ReactionValuePrecision,
  WithId,
  WithIdName,
} from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import type { ReactionAnalysisType } from 'store/entities/reactions/reactionEntityTypes/reactionEntityTypes.types.ts';
import type { ReactionProduct } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';

export interface ReactionAnalysis
  extends WithIdName<Pick<ord.IAnalysis, 'details' | 'chmoId' | 'instrumentManufacturer'>> {
  type: ReactionAnalysisType;
  analysisData: Record<string, AppData>;
  instrumentLastCalibrated: string | null;
  isOfIsolatedSpecies: ReactionBoolean;
}

export interface ReactionOutcome extends WithId<object> {
  reactionTime: ReactionTime;
  conversion: ReactionValuePrecision;
  analyses: Record<string, ReactionAnalysis>;
  products: Array<ReactionProduct>;
}
