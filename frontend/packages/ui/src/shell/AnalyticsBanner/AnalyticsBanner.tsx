/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { Button, Group, Text } from '@mantine/core';
import clsx from 'clsx';
import { chooseAnalytics, useAnalytics } from '#shell/analytics.ts';
import classes from './AnalyticsBanner.module.scss';

export const PRIVACY_NOTICE_URL =
  'https://docs.open-reaction-database.org/en/latest/site_privacy.html';

/** Asks the visitor whether the page may load Google Analytics, while they have not said. */
export function AnalyticsBanner({ className }: Readonly<{ className?: string }>) {
  const { available, asking } = useAnalytics();
  if (!available || !asking) {
    return null;
  }
  return (
    <section
      aria-label="Analytics"
      className={clsx(classes.root, className)}
    >
      <Text
        size="sm"
        className={classes.text}
      >
        May we use Google Analytics? It sets cookies and tells Google which pages you
        visit, so we can see how the site is used.{' '}
        <a
          href={PRIVACY_NOTICE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy notice
        </a>
      </Text>
      <Group
        gap="xs"
        wrap="nowrap"
      >
        <Button onClick={() => chooseAnalytics('denied')}>Decline</Button>
        <Button onClick={() => chooseAnalytics('granted')}>Accept</Button>
      </Group>
    </section>
  );
}
