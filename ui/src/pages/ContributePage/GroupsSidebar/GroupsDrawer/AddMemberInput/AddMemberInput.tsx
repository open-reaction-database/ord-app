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
import { useSelector } from 'react-redux';
import { Button, Group, Input } from '@mantine/core';
import { AlertCircleIcon } from 'common/icons';
import { useAppDispatch } from 'store/useAppDispatch';
import {
  selectAddMemberError,
  selectAddMemberInputValue,
  selectIsGroupUpdating,
  selectMemberRoles,
} from 'store/groups/groups.selectors';
import { addGroupMember } from 'store/groups/groups.thunks';
import { resetAddMemberErrorAction, setAddMemberInputValueAction } from 'store/groups/groups.actions';
import classes from './AddMemberInput.module.scss';

export function AddMemberInput() {
  const dispatch = useAppDispatch();

  const inputValue = useSelector(selectAddMemberInputValue);
  const inputError = useSelector(selectAddMemberError);

  const isGroupUpdating = useSelector(selectIsGroupUpdating);
  const { isAdmin } = useSelector(selectMemberRoles);

  const handleAddMember = async () => {
    dispatch(addGroupMember(inputValue));
    dispatch(setAddMemberInputValueAction(''));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAddMemberInputValueAction(e.target.value));

    if (inputError) {
      dispatch(resetAddMemberErrorAction());
    }
  };

  return (
    <div className={classes.inputContainer}>
      <Input.Wrapper
        error={
          inputError && (
            <Group gap="4px">
              <AlertCircleIcon color="red" />
              There is no user in ORD with this identifier yet
            </Group>
          )
        }
      >
        <Input
          placeholder="Add user by email or ID (ORCID, etc.)"
          value={inputValue}
          onChange={handleSearchChange}
          disabled={!isAdmin || isGroupUpdating}
          error={!!inputError}
        />
      </Input.Wrapper>

      <Button
        onClick={handleAddMember}
        disabled={!isAdmin || !!inputError || isGroupUpdating}
      >
        Add User
      </Button>
    </div>
  );
}
