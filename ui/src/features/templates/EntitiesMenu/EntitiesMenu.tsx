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
import { Button, Flex, Paper } from '@mantine/core';
import classes from './EntitiesMenu.module.scss';
import { DatasetsIcon, TemplatesIcon } from 'common/icons';
import clsx from 'clsx';

export function EntitiesMenu() {
  return (
    <Paper
      className={classes.root}
      radius="sm"
      p="sm"
    >
      <Flex direction="column">
        <Button
          classNames={{
            root: clsx(classes.groupButton, { [classes.selected]: window.location.pathname === '/datasets' }),
            section: classes.buttonSection,
          }}
          variant="transparent"
          leftSection={<DatasetsIcon />}
          onClick={() => (window.location.href = '/datasets')}
          justify="flex-start"
        >
          Datasets
        </Button>
        <Button
          classNames={{
            root: clsx(classes.groupButton, { [classes.selected]: window.location.pathname === '/templates' }),
            section: classes.buttonSection,
          }}
          variant="transparent"
          leftSection={<TemplatesIcon />}
          onClick={() => (window.location.href = '/templates')}
          justify="flex-start"
        >
          Templates
        </Button>
      </Flex>
    </Paper>
  );
}
