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
import { UserField } from 'common/components/display/UserField/UserField.tsx';
import { GroupsListWithRoles } from 'common/components/GroupsListWithRoles/GroupsListWithRoles.tsx';
import { formatDate } from 'common/utils';
import type { Dataset } from 'store/entities/datasets/datasets.types.ts';

export const columns: Array<MRT_ColumnDef<Dataset>> = [
  {
    id: 'datasetName',
    accessorKey: 'name',
    header: 'Dataset Name',
    Cell: ({ row }) => {
      return <>{row.original.name || `Dataset ${row.original.id}`}</>;
    },
    size: 230,
  },
  {
    id: 'size',
    accessorFn: originalRow => originalRow.reactions_count.total,
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
      return <>{formatDate(row.original.modified_at)}</>;
    },
    size: 145,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    size: 280,
  },
];
