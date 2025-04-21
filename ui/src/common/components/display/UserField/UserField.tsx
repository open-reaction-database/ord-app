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
import { Avatar, Group } from '@mantine/core';
import { typographyClasses } from 'common/styling';

interface UserFieldProps {
  username: string;
}

export function UserField({ username }: Readonly<UserFieldProps>) {
  return (
    // TODO: Update avatar src and consider the behaviour for long names
    <Group
      gap="4px"
      className={typographyClasses.oneLineTextWrapperWithContent}
    >
      <Avatar
        src={null}
        size="28"
      />
      <span className={typographyClasses.oneLineText}>{username}</span>
    </Group>
  );
}
