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
import { Flex } from '@mantine/core';
import { Github, Linkedin } from 'common/icons';
import classes from './footer.module.scss';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Flex className={classes.root}>
      <div className={classes.copyright}>© Copyright {year} Open Reaction Database</div>
      <div>
        <a href="mailto:help@open‑reaction-database.org">help@open‑reaction-database.org</a>
      </div>
      <div className={classes.footerLinks}>
        <a
          href="https://github.com/open-reaction-database/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
        </a>
        <a
          href="https://www.linkedin.com/company/open-reaction-database/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin />
        </a>
      </div>
    </Flex>
  );
}
