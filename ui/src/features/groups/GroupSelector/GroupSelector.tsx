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
import { Select, type SelectProps } from '@mantine/core';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectOrderedGroupsList } from 'store/entities/groups/groups.selectors.ts';

type GroupSelectorProps = Omit<SelectProps, 'data'>;

export function GroupSelector({ ...rest }: Readonly<GroupSelectorProps>) {
  const groupsList = useSelector(selectOrderedGroupsList);
  const data = useMemo(() => {
    return groupsList.map(group => ({ value: group.id.toString(), label: group.name }));
  }, [groupsList]);
  return (
    <Select
      data={data}
      label="Group"
      placeholder="Select a group"
      searchable
      required
      {...rest}
    />
  );
}
