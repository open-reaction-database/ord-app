import type { USER_ROLES } from 'common/types';
import type { User } from 'store/entities/users/users.types.ts';

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
export interface Group {
  id: number;
  name: string;
  created_at: string;
  modified_at: string;
  members?: Array<GroupMember>;
}

export interface GroupMember {
  id: number;
  role: USER_ROLES;
  user: User;
}

export interface GroupItem {
  id: number;
  role: USER_ROLES;
  name: string;
}
