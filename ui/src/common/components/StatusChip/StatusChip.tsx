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
import { Chip } from '@mantine/core';
import { DATASET_STATUS } from '../../model/datasetStatus';
import classes from './StatusChip.module.scss';
import { getDataset } from '../../../store/datasets/datasets.thunks.ts';
import { useAppDispatch } from '../../../store/useAppDispatch.ts';

interface StatusChipProps {
  status: DATASET_STATUS;
}

// TODO: Update when palette is ready
const statusToColorMapping = new Map<DATASET_STATUS, string>([
  [DATASET_STATUS.IN_PROGRESS, '#3C78D8'],
  [DATASET_STATUS.UNDER_REVIEW, '#CC7914'],
  [DATASET_STATUS.NEED_REVISION, '#E4626F'],
  [DATASET_STATUS.APPROVED, '#0B7B69'],
  [DATASET_STATUS.PUBLISHED, '#637D92'],
]);

export function StatusChip({ status }: Readonly<StatusChipProps>) {
  const dispatch = useAppDispatch();
  const chipColor = statusToColorMapping.get(status);
  dispatch(getDataset(2));

  return (
    <Chip
      color={chipColor}
      size="xs"
      radius="xl"
      variant="light"
      checked
      classNames={{
        label: classes.chip,
        iconWrapper: classes.iconWrapper,
      }}
      style={{
        '--chip-bg': `${chipColor}33`,
        '--chip-hover': `${chipColor}33`,
      }}
    >
      {status}
    </Chip>
  );
}
