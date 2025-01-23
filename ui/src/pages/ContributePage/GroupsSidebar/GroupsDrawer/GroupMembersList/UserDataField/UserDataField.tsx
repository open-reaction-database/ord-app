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
import classes from './UserDataField.module.scss';

interface UserDataFieldProps {
  fieldName: string;
  value?: string;
}

export function UserDataField({ fieldName, value }: Readonly<UserDataFieldProps>) {
  return (
    <div>
      <span className={classes.category}>{fieldName}:</span>
      <span>{value ?? 'Unavailable'}</span>
    </div>
  );
}
