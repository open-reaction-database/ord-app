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
import { useCallback } from 'react';
import { Button, Menu } from '@mantine/core';
import { useSelector } from 'react-redux';
import { createEmptyReaction } from 'store/reactions/reactions.thunks';
import { useAppDispatch } from 'store/useAppDispatch';
import { AddCircleIcon, ChevronDownIcon } from 'common/icons';
import { CreateReactionFromFile } from './CreateReactionFromFile/CreateReactionFromFile';
import { selectIsReactionUploadOpened } from 'store/reactions/reactions.selectors';
import { setReactionUploadOpenedAction } from 'store/reactions/reactions.actions';
import classes from './createReactionMenu.module.scss';

export function CreateReactionMenu() {
  const dispatch = useAppDispatch();
  const isReactionUploadOpened = useSelector(selectIsReactionUploadOpened);

  const handleReactionCreate = useCallback(() => dispatch(createEmptyReaction()), [dispatch]);

  const handleReactionUpload = useCallback(() => dispatch(setReactionUploadOpenedAction(true)), [dispatch]);

  return (
    <>
      <Menu
        classNames={{
          dropdown: classes.dropdown,
          item: classes.menuItem,
          itemSection: classes.menuItemSection,
        }}
      >
        <Menu.Target>
          <Button
            classNames={{ root: classes.buttonRoot, inner: classes.buttonInner }}
            leftSection={<AddCircleIcon />}
            rightSection={<ChevronDownIcon />}
          >
            Reaction
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={handleReactionCreate}>From Scratch</Menu.Item>
          <Menu.Item onClick={handleReactionUpload}>Import from File</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {isReactionUploadOpened && <CreateReactionFromFile />}
    </>
  );
}
