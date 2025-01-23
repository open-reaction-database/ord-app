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
import { DataTable } from 'common/components/DataTable/DataTable';
import { Pagination } from 'common/components/Pagination/Pagination';
import classes from './DatasetTable.module.scss';
import { useSelector } from 'react-redux';
import {
  selectAreDatasetsLoading,
  selectDatasetsPagination,
  selectOrderedDatasets,
} from 'store/datasets/datasets.selectors';
import { columns } from './datasetTable.columns';
import { useAppDispatch } from 'store/useAppDispatch';
import { useCallback } from 'react';
import { getDatasetsPage } from 'store/datasets/datasets.thunks';
import { useLocation } from 'wouter';

export function DatasetTable() {
  const dispatch = useAppDispatch();
  const pagination = useSelector(selectDatasetsPagination);
  const datasets = useSelector(selectOrderedDatasets);
  const isLoading = useSelector(selectAreDatasetsLoading);
  const [, navigate] = useLocation();

  const onPageChange = useCallback(
    (page: number) => {
      dispatch(getDatasetsPage({ page }));
    },
    [dispatch],
  );

  const onPageSizeChange = useCallback(
    (pageSize: number) => {
      dispatch(getDatasetsPage({ page: 1, size: pageSize }));
    },
    [dispatch],
  );

  return (
    <div className={classes.tableContainer}>
      <DataTable
        columns={columns}
        data={datasets}
        state={{ isLoading }}
        enableSorting={false}
        mantineTableProps={{
          className: classes.table,
        }}
        mantineTableBodyRowProps={({ row }) =>
          row.original.id
            ? {
                onClick: () => navigate(`/dataset/${row.original.id}`),
              }
            : {}
        }
      />
      <Pagination
        currentPage={pagination.page}
        onPageChange={onPageChange}
        rowsPerPage={pagination.size}
        onRowsPerPageChange={onPageSizeChange}
        totalPages={pagination.pages}
      />
    </div>
  );
}
