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
import type { PropsWithChildren, ReactNode } from 'react';
import { AppShell, Flex } from '@mantine/core';
import classes from './PageContainer.module.scss';
import ORDLogo from './ORDLogo.png';
import { Breadcrumbs } from '#shell/Breadcrumbs/Breadcrumbs.tsx';
import type { Breadcrumb } from './breadcrumbs.ts';
import { Footer } from '#shell/Footer/Footer.tsx';

export interface PageContainerProps extends PropsWithChildren {
  breadcrumbs: Array<Breadcrumb>;
  badge?: ReactNode;
  /** Controls at the right of the header, such as the signed-in user's menu. */
  headerActions?: ReactNode;
}

export function PageContainer({
  children,
  breadcrumbs,
  badge,
  headerActions,
}: Readonly<PageContainerProps>) {
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

        {headerActions}
      </AppShell.Header>

      <AppShell.Main>
        <Flex
          direction="column"
          className={classes.content}
        >
          <Flex direction="row">
            <Breadcrumbs items={breadcrumbs} />
            {badge}
          </Flex>
          {children}
        </Flex>
      </AppShell.Main>

      <AppShell.Footer withBorder={true}>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
