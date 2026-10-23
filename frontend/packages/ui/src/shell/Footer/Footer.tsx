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
import { Github, Linkedin } from '#theme/icons/index.ts';
import classes from './footer.module.scss';

const REPOSITORY = 'https://github.com/open-reaction-database/ord-app';

// A build's commit as the image's GIT_COMMIT build argument gives it: the full SHA, with
// -dirty when the tree had changes.
const BUILT_COMMIT = /^([0-9a-f]{40})(-dirty)?$/;

export interface FooterProps {
  /**
   * The ord-app commit the host's bundle was built from. Anything but a full SHA, such as
   * `unknown` or nothing, shows no commit.
   */
  commit?: string;
}

/** The commit, abbreviated and linked to its page on GitHub. */
function BuiltCommit({ commit }: Readonly<{ commit: string }>) {
  const match = BUILT_COMMIT.exec(commit);
  if (!match) {
    return null;
  }
  const [, sha, dirty = ''] = match;
  return (
    <div>
      Commit{' '}
      <a
        className={classes.commit}
        href={`${REPOSITORY}/commit/${sha}`}
        title={commit}
        target="_blank"
        rel="noopener noreferrer"
      >
        {sha.slice(0, 7)}
        {dirty}
      </a>
    </div>
  );
}

export function Footer({ commit = '' }: Readonly<FooterProps>) {
  const year = new Date().getFullYear();

  return (
    <Flex className={classes.root}>
      <div>© Copyright {year} Open Reaction Database</div>
      <div>
        <a href="mailto:help@open-reaction-database.org">
          help@open-reaction-database.org
        </a>
      </div>
      <BuiltCommit commit={commit} />
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
