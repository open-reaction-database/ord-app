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
import { useState } from 'react';
import { Pagination } from '../../../../common/components/Pagination/Pagination';
import { ReactionCard } from '../ReactionCard/ReactionCard';
import type { Reaction } from '../../../../common/model/reaction';

interface ReactionListProps {
  reactions: Reaction[];
}

export function ReactionList({ reactions }: Readonly<ReactionListProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const currentReactions = reactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      {currentReactions.map((reaction, index) => (
        <ReactionCard
          key={reaction.id}
          reaction={reaction}
          index={(currentPage - 1) * rowsPerPage + index + 1}
        />
      ))}
      <Pagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        totalPages={Math.ceil(reactions.length / rowsPerPage)}
      />
    </>
  );
}
