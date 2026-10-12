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
import type { MRT_ColumnDef } from 'mantine-react-table';
import { type MouseEvent } from 'react';
import { UserField } from 'common/components/display/UserField/UserField.tsx';
import { GroupsListWithRoles } from 'common/components/GroupsListWithRoles/GroupsListWithRoles.tsx';
import { formatUtcDateToDisplay } from '@open-reaction-database/ui/reaction/model';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';
import {
  typographyClasses,
  DotsIcon,
  AlertCircleIcon,
} from '@open-reaction-database/ui/theme';
import { ActionIcon, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import classes from './datasetTable.module.scss';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { downloadDatasetThroughLink } from 'store/utils/downloadFile.thunks.ts';
import { datasetFileDownloadOptions } from 'common/constants.ts';

export const handleMenu = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

const datasetNameOf = (dataset: Dataset) => dataset.name ?? `Dataset ${dataset.id}`;

/**
 * Lets a column shrink from its size down to `minWidth` when the table is short of room; MRT
 * otherwise makes each column's size its minimum width.
 */
function shrinksTo(minWidth: number) {
  return {
    mantineTableHeadCellProps: { style: { minWidth } },
    mantineTableBodyCellProps: { style: { minWidth } },
  };
}

export const columns: Array<MRT_ColumnDef<Dataset>> = [
  {
    id: 'datasetName',
    accessorKey: 'name',
    header: 'Dataset Name',
    Cell: ({ row }) => {
      const datasetName = datasetNameOf(row.original);
      return (
        <Tooltip label={datasetName}>
          <div
            className={clsx(
              typographyClasses.oneLineText,
              classes.fillsColumn,
              classes.datasetName,
            )}
          >
            {datasetName}
          </div>
        </Tooltip>
      );
    },
    size: 230,
  },
  {
    id: 'size',
    Cell: ({ row }) => {
      const hasInvalidReactions = row.original.reactions_count?.invalid > 0;
      const tooltipText = hasInvalidReactions
        ? `Dataset contains ${row.original.reactions_count?.total} reactions, ${row.original.reactions_count?.invalid} are invalid`
        : 'All reactions are valid';
      return (
        <Tooltip label={tooltipText}>
          <div className={classes.sizeCell}>
            {row.original.reactions_count?.total != null && (
              <span className={classes.sizeBadge}>
                {row.original.reactions_count.total}
              </span>
            )}
            {hasInvalidReactions && (
              <div className={classes.invalidIcon}>
                <span className={classes.countDivider}>/</span>
                <AlertCircleIcon />
                {row.original.reactions_count.invalid}
              </div>
            )}
          </div>
        </Tooltip>
      );
    },
    header: 'Size',
    size: 80,
  },
  {
    id: 'group',
    accessorKey: 'group',
    header: 'Group',
    Cell: ({ row }) => {
      return (
        <div className={clsx(classes.fillsColumn, classes.groupsCell)}>
          <GroupsListWithRoles data={row.original.groups} />
        </div>
      );
    },
    size: 145,
  },
  {
    id: 'owner',
    accessorKey: 'owner',
    header: 'Owner',
    Cell: ({ row }) => {
      const ownerName = row.original.owner.name;
      return (
        <Tooltip label={ownerName}>
          <div
            className={clsx(
              typographyClasses.oneLineText,
              classes.fillsColumn,
              classes.ownerName,
            )}
          >
            <UserField username={ownerName} />
          </div>
        </Tooltip>
      );
    },
    size: 145,
    ...shrinksTo(100),
  },
  {
    id: 'lastModified',
    accessorKey: 'lastModified',
    header: 'Last Modified',
    Cell: ({ row }) => {
      return <span>{formatUtcDateToDisplay(row.original.modified_at)}</span>;
    },
    size: 145,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    Cell: ({ row }) => {
      return (
        <Tooltip label={row.original.description}>
          <div className={clsx(typographyClasses.oneLineText, classes.fillsColumn)}>
            {row.original.description}
          </div>
        </Tooltip>
      );
    },
    size: 280,
    // Gives up the most room, as the column least needed to tell one dataset from another.
    ...shrinksTo(120),
  },
  {
    id: 'menu',
    Cell: ({ row }) => {
      return (
        <DownloadMenu
          options={datasetFileDownloadOptions}
          download={format => downloadDatasetThroughLink(row.original.id, format)}
          target={
            <ActionIcon
              aria-label={`Download dataset ${datasetNameOf(row.original)}`}
              title={`Download dataset ${datasetNameOf(row.original)}`}
              onClick={handleMenu}
              variant="transparent"
              color="default"
            >
              <DotsIcon className={classes.datasetMenu} />
            </ActionIcon>
          }
        />
      );
    },
    header: '',
    size: 20,
  },
];
