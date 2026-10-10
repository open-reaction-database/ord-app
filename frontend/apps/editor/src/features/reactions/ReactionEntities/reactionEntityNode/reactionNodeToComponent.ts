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
import { ReactionFormNodeType } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import {
  ReactionEntityGroup,
  ReactionEntityBlockNode,
  ReactionEntityVPU,
  ReactionEntityValue,
  ReactionEntitySelect,
  ReactionEntityRow,
  ReactionEntityCustom,
} from './components.ts';
import type { ReactionNodeToComponent } from './reactionEntityNode.types.ts';
import { ReactionEntityList } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityList/ReactionEntityList.tsx';
import { ReactionEntityData } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityData/ReactionEntityData.tsx';
import { ReactionEntityDate } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityDate/ReactionEntityDate.tsx';
import { ReactionEntityDateTime } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityDateTime/ReactionEntityDateTime.tsx';
import { ReactionEntityEmpty } from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityEmpty.tsx';

// Cannot produce correct type for this map since every item has its own type
export const reactionNodeToComponent = {
  [ReactionFormNodeType.custom]: ReactionEntityCustom,
  [ReactionFormNodeType.value]: ReactionEntityValue,
  [ReactionFormNodeType.select]: ReactionEntitySelect,
  [ReactionFormNodeType.group]: ReactionEntityGroup,
  [ReactionFormNodeType.wrapper]: ReactionEntityRow,
  [ReactionFormNodeType.vpu]: ReactionEntityVPU,
  [ReactionFormNodeType.block]: ReactionEntityBlockNode,
  [ReactionFormNodeType.list]: ReactionEntityList,
  [ReactionFormNodeType.data]: ReactionEntityData,
  [ReactionFormNodeType.date]: ReactionEntityDate,
  [ReactionFormNodeType.dateTime]: ReactionEntityDateTime,
  [ReactionFormNodeType.empty]: ReactionEntityEmpty,
} as ReactionNodeToComponent;
