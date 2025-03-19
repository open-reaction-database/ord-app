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
import { Flex, Paper } from '@mantine/core';
import classes from './EntitiesMenu.module.scss';
import { DatasetsIcon, TemplatesIcon } from 'common/icons';
import { useLocation, useRouter } from 'wouter';
import { SelectableButton } from 'common/components/SelectableButton/SelectableButton.tsx';

export function EntitiesMenu() {
  const [, navigate] = useLocation();
  const router = useRouter();
  return (
    <Paper
      className={classes.root}
      radius="sm"
      p="sm"
    >
      <Flex direction="column">
        <SelectableButton
          isSelected={router.base === '/datasets'}
          leftSection={<DatasetsIcon />}
          onClick={() => navigate('~/datasets')}
        >
          Datasets
        </SelectableButton>
        <SelectableButton
          isSelected={router.base === '/templates'}
          leftSection={<TemplatesIcon />}
          onClick={() => navigate('~/templates')}
        >
          Templates
        </SelectableButton>
      </Flex>
    </Paper>
  );
}
