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
import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { ActionIcon, Button, Divider, Drawer, Flex, Loader, NumberInput, Title } from '@mantine/core';
import {
  getDatasetGroups,
  shareDatasetWithGroup,
  unshareDatasetWithGroup,
} from 'store/entities/datasets/datasets.thunks.ts';
import { selectAreDatasetGroupsLoading, selectDatasetGroups } from 'store/entities/datasets/datasets.selectors.ts';
import { useSelector } from 'react-redux';
import { useField } from '@mantine/form';
import classes from './shareDataset.module.scss';
import { RemoveIcon } from 'common/icons';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay.tsx';
import { typographyClasses } from 'common/styling';
import { clearDatasetGroupsListAction } from 'store/entities/datasets/datasets.actions.ts';
import { ConfirmPopover } from 'common/components/interactions/ConfirmPopover/ConfirmPopover.tsx';
import { useDisclosure } from '@mantine/hooks';
import type { DatasetGroup } from 'store/entities/datasets/datasets.types.ts';

interface ShareDatasetSidebarProps {
  datasetId: number;
  onClose: () => void;
}

interface GroupsListItemProps {
  group: DatasetGroup;
  onUnshareWithGroup: (groupId: number) => void;
}

function GroupListItem({ group, onUnshareWithGroup }: Readonly<GroupsListItemProps>) {
  const [popoverOpened, { open, close }] = useDisclosure();
  return (
    <Flex
      align="flex-end"
      justify="space-between"
      gap="md"
    >
      <Flex
        direction="column"
        className={typographyClasses.oneLineTextWrapper}
      >
        <KeyValueDisplay
          label="Name"
          value={group.name}
        />
        <KeyValueDisplay
          label="Id"
          value={group.id}
        />
      </Flex>
      <ConfirmPopover
        opened={popoverOpened}
        onCancel={close}
        onConfirm={() => onUnshareWithGroup(group.id)}
        target={
          <ActionIcon
            color="red"
            variant="transparent"
            size="sm"
            onClick={open}
          >
            <RemoveIcon />
          </ActionIcon>
        }
        text="Are you sure you want to unshare this dataset with this group?"
        title="Unshare dataset"
      />
    </Flex>
  );
}

export function ShareDatasetSidebar({ datasetId, onClose }: Readonly<ShareDatasetSidebarProps>) {
  const dispatch = useAppDispatch();
  const groups = useSelector(selectDatasetGroups);
  const areGroupsLoading = useSelector(selectAreDatasetGroupsLoading);
  const field = useField<string | number>({
    initialValue: '',
    validateOnBlur: true,
    validate: value => (typeof value === 'number' ? null : 'Invalid group id'),
  });
  useEffect(() => {
    dispatch(getDatasetGroups(datasetId));

    return () => {
      dispatch(clearDatasetGroupsListAction());
    };
  }, [dispatch, datasetId]);

  const [primaryGroupId, groupsList] = useMemo(() => {
    if (groups === null) {
      return [0, []];
    }
    const primaryGroupId = groups.find(group => group.is_primary)!.id;
    return [primaryGroupId, groups.filter(group => !group.is_primary)];
  }, [groups]);

  const onShareWithGroup = useCallback(() => {
    field.validate().then(errorMessage => {
      if (!errorMessage) {
        const value = field.getValue() as number;
        field.reset();
        dispatch(shareDatasetWithGroup({ datasetId, primaryGroupId, groupId: value }));
      }
    });
  }, [datasetId, dispatch, field, primaryGroupId]);

  const onUnshareWithGroup = useCallback(
    (groupId: number) => {
      dispatch(unshareDatasetWithGroup({ datasetId, primaryGroupId, groupId }));
    },
    [datasetId, dispatch, primaryGroupId],
  );

  return (
    <Drawer
      opened
      onClose={onClose}
      title="Share Dataset"
      position="right"
      classNames={{ content: classes.shareSidebar }}
    >
      {areGroupsLoading ? (
        <Flex justify="center">
          <Loader size="lg" />
        </Flex>
      ) : (
        <Flex
          direction="column"
          gap="md"
        >
          <Flex
            align="flex-start"
            justify="space-between"
            gap="sm"
          >
            <NumberInput
              {...field.getInputProps()}
              placeholder="Enter numeric group id"
              className={classes.inputWrapper}
            />
            <Button onClick={onShareWithGroup}>Share with group</Button>
          </Flex>
          <Divider orientation="horizontal" />
          <Flex
            direction="column"
            gap="sm"
          >
            <Flex
              align="center"
              gap="xs"
            >
              <Title order={3}>Groups</Title>
              <Counter amount={groupsList.length} />
            </Flex>
            {groupsList.map(item => (
              <GroupListItem
                key={item.id}
                group={item}
                onUnshareWithGroup={onUnshareWithGroup}
              />
            ))}
          </Flex>
        </Flex>
      )}
    </Drawer>
  );
}
