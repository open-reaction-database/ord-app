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
import { useEffect, useState } from 'react';
import type { MRT_ColumnDef } from 'mantine-react-table';
import { DataTable } from '../../common/components/DataTable/DataTable';
import { Pagination } from '../../common/components/Pagination/Pagination';
import { StatusChip } from '../../common/components/StatusChip/StatusChip';
import { UserField } from '../../common/components/UserField/UserField';
import { generateMockDatasets } from '../../common/mocks/generateMockDatasets';
import type { DATASET_STATUS } from '../../common/model/datasetStatus';
import { formatDate } from '../../common/utils';
import classes from './DatasetTable.module.scss';

export interface DatasetTableRow {
  datasetName: string;
  size: number;
  status: DATASET_STATUS;
  group: string;
  owner: string;
  lastModified: string;
  description: string;
}

const mockData = generateMockDatasets(200);

const columns: MRT_ColumnDef<DatasetTableRow>[] = [
  {
    id: 'datasetName',
    accessorKey: 'datasetName',
    header: 'Dataset Name',
    size: 230,
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: 'Size',
    size: 80,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row }) => {
      return <StatusChip status={row.original.status} />;
    },
    size: 110,
  },
  {
    id: 'group',
    accessorKey: 'group',
    header: 'Group',
    size: 145,
  },
  {
    id: 'owner',
    accessorKey: 'owner',
    header: 'Owner',
    Cell: ({ row }) => {
      // TODO: Update avatar src and consider the behaviour for long names
      return <UserField username={row.original.owner} />;
    },
    size: 145,
  },
  {
    id: 'lastModified',
    accessorKey: 'lastModified',
    header: 'Last Modified',
    Cell: ({ row }) => {
      return <>{formatDate(row.original.lastModified)}</>;
    },
    size: 145,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'buttons',
    header: '',
    enableSorting: false,
    // TODO: Replace with button elements
    Cell: () => {
      return <div className={classes.buttons}>Click</div>;
    },
  },
];

export function DatasetTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Update when BE part is ready
    const fetchData = async () => {
      setIsLoading(true);

      await new Promise(resolve =>
        setTimeout(() => {
          resolve(`${currentPage} ${rowsPerPage}`);
        }, 1000),
      );

      setIsLoading(false);
    };

    fetchData();
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(mockData.length / rowsPerPage);

  return (
    <div className={classes.tableContainer}>
      <DataTable
        columns={columns}
        data={mockData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
        state={{ isLoading }}
        mantineTableProps={{
          className: classes.table,
        }}
      />
      <Pagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        totalPages={totalPages}
      />
    </div>
  );
}
