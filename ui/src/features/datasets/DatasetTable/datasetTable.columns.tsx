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
import { formatDate } from 'common/utils';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';
import { typographyClasses } from 'common/styling';
import { Tooltip } from '@mantine/core';
import clsx from 'clsx';
import classes from './datasetTable.module.scss';
import { DotsIcon, AlertCircleIcon } from 'common/icons';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import { fileDownloadOptions } from 'common/constants.ts';

export const handleMenu = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

export const columns: Array<MRT_ColumnDef<Dataset>> = [
  {
    id: 'datasetName',
    accessorKey: 'name',
    header: 'Dataset Name',
    Cell: ({ row }) => {
      const datasetName = row.original.name ?? `Dataset ${row.original.id}`;
      return (
        <Tooltip label={datasetName}>
          <div className={clsx(typographyClasses.oneLineText, classes.datasetName)}>{datasetName}</div>
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
            {row.original.reactions_count?.total}
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
      return <GroupsListWithRoles data={row.original.groups} />;
    },
    size: 145,
  },
  {
    id: 'owner',
    accessorKey: 'owner',
    header: 'Owner',
    Cell: ({ row }) => {
      return <UserField username={row.original.owner.name} />;
    },
    size: 145,
  },
  {
    id: 'lastModified',
    accessorKey: 'lastModified',
    header: 'Last Modified',
    Cell: ({ row }) => {
      return <span>{formatDate(row.original.modified_at)}</span>;
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
          <div className={typographyClasses.oneLineText}>{row.original.description}</div>
        </Tooltip>
      );
    },
    size: 280,
  },
  {
    id: 'menu',
    Cell: ({ row }) => {
      return (
        <DownloadMenu
          options={fileDownloadOptions}
          url={`/datasets/${row.original.id}/download`}
          target={
            <DotsIcon
              className={classes.datasetMenu}
              onClick={handleMenu}
            />
          }
        />
      );
    },
    header: '',
    size: 20,
  },
];
