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
import type { PropsWithChildren } from 'react';
import { AppShell, Avatar, Group } from '@mantine/core';
import classes from './PageContainer.module.scss';
import ORDLogo from '../../../assets/ORD_logo.png';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <AppShell
      classNames={{
        header: classes.header,
        main: classes.main,
        footer: classes.footer,
      }}
    >
      <AppShell.Header>
        <img
          src={ORDLogo}
          className={classes.logo}
          alt="Open Reaction Database logo"
        />

        {/* TODO: Replace with user details component */}
        <Group
          gap="4px"
          className={classes.userDetails}
        >
          <Avatar
            src={null}
            size="sm"
          />
          John Doe
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Breadcrumbs
          items={[
            { title: 'Contribute', path: '/' },
            { title: 'Dataset 123', path: '/dataset/123' },
          ]}
        />
        {children}
      </AppShell.Main>

      <AppShell.Footer withBorder={false}>© Copyright 2024 Open Reaction Database</AppShell.Footer>
    </AppShell>
  );
}
