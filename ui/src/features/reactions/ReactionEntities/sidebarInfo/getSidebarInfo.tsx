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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionSidebarInfo } from './sidebarInfo.types.ts';
import { allowedEntityNames, reactionSidebarInfo } from './sidebarInfo.models.ts';

function getEntityPathComponent(pathComponents: ReactionPathComponents): [ReactionPathComponents, string] {
  const [entity, ...rest] = pathComponents;
  if (typeof entity === 'number' || !allowedEntityNames.includes(entity)) {
    return getEntityPathComponent(rest);
  }
  return [rest, entity];
}

export function getSidebarInfo(
  pathComponents: ReactionPathComponents,
  index: number = 0,
  sidebarInfoCandidates: Array<ReactionSidebarInfo> = reactionSidebarInfo,
): ReactionSidebarInfo {
  const [updatedPathComponents, currentPath] = getEntityPathComponent(pathComponents);
  let filteredSidebarInfoCandidates = sidebarInfoCandidates.filter(
    (candidate: ReactionSidebarInfo) => candidate.pathComponents[index] === currentPath,
  );
  if (updatedPathComponents.length === 0) {
    filteredSidebarInfoCandidates = filteredSidebarInfoCandidates.filter(
      (candidate: ReactionSidebarInfo) => candidate.pathComponents.length === index + 1,
    );
  }
  if (filteredSidebarInfoCandidates.length === 1) {
    return filteredSidebarInfoCandidates[0];
  } else if (filteredSidebarInfoCandidates.length === 0) {
    throw new Error('Invalid path');
  }
  return getSidebarInfo(updatedPathComponents, index + 1, filteredSidebarInfoCandidates);
}
