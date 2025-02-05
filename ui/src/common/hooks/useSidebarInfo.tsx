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
import { ReactionEntity } from '../model/reaction/reactionEntityToForm.models';
import { useMemo, type ReactNode } from 'react';
import { Title } from '@mantine/core';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents';

export interface ReactionSidebarInfo {
  pathComponents: Array<string>;
  entityName: ReactionEntity;
  sidebarTitle: ReactNode;
}

const reactionSidebarInfo: Array<ReactionSidebarInfo> = [
  { pathComponents: ['notes'], entityName: ReactionEntity.Notes, sidebarTitle: <Title order={2}>Notes</Title> },
  { pathComponents: ['inputsMap'], entityName: ReactionEntity.Inputs, sidebarTitle: <Title order={2}>Input</Title> },
];

function getEntityPathComponent(pathComponents: ReactionPathComponents): [ReactionPathComponents, string] {
  const [entity, ...rest] = pathComponents;
  if (typeof entity === 'number') {
    return getEntityPathComponent(rest);
  }
  return [rest, entity];
}

function getSidebarInfo(
  pathComponents: ReactionPathComponents,
  index: number = 0,
  sidebarInfoCandidates: Array<ReactionSidebarInfo> = reactionSidebarInfo,
): ReactionSidebarInfo {
  const [updatedPathComponents, currentPath] = getEntityPathComponent(pathComponents);
  const filteredSidebarInfoCandidates = sidebarInfoCandidates.filter(
    (candidate: ReactionSidebarInfo) => candidate.pathComponents[index] === currentPath,
  );
  if (filteredSidebarInfoCandidates.length === 1) {
    return filteredSidebarInfoCandidates[0];
  } else if (filteredSidebarInfoCandidates.length === 0) {
    throw new Error('Invalid path');
  }
  return getSidebarInfo(updatedPathComponents, index + 1, filteredSidebarInfoCandidates);
}

export function useSidebarInfo(pathComponents: undefined): null;
export function useSidebarInfo(pathComponents: ReactionPathComponents): ReactionSidebarInfo;

export function useSidebarInfo(pathComponents?: ReactionPathComponents): ReactionSidebarInfo | null {
  return useMemo(() => {
    if (!pathComponents) {
      return null;
    }
    return getSidebarInfo(pathComponents);
  }, [pathComponents]);
}
