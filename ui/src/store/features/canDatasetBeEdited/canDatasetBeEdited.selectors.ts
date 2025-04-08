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
import { createSelector } from '@reduxjs/toolkit';
import { selectActiveDatasetId } from '../../entities/reactions/reactions.selectors.ts';
import { selectGroupsByIds } from '../../entities/groups/groups.selectors.ts';
import { selectDatasets } from '../../entities/datasets/datasets.selectors.ts';
import { USER_ROLES } from 'common/types';

export const selectCanDatasetBeEdited = createSelector(
  [selectActiveDatasetId, selectDatasets, selectGroupsByIds],
  (activeDatasetId, datasets, groups) => {
    const dataset = datasets[activeDatasetId];
    if (!dataset) return false;

    const roles = dataset.groups.map(group => groups[group.id]?.role);
    return roles.some(role => [USER_ROLES.ADMIN, USER_ROLES.EDITOR].includes(role));
  },
);
