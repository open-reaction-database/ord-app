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
import { LogoIcon } from 'common/icons';
import classes from './pageLoader.module.scss';
import { Flex, Loader } from '@mantine/core';

export function PageLoader() {
  return (
    <Flex
      align="center"
      justify="center"
      className={classes.root}
    >
      <Flex
        className={classes.loaderWrapper}
        direction="column"
        align="center"
        justify="center"
        gap="sm"
      >
        <LogoIcon />
        <Flex
          gap="sm"
          align="center"
        >
          <Loader size={16} />
          <span className={classes.loaderText}>Loading...</span>
        </Flex>
      </Flex>
    </Flex>
  );
}
