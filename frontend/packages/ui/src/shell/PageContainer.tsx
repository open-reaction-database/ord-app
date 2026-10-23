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
import { AppShell, Flex, Group } from '@mantine/core';
import { Link } from 'wouter';
import classes from './PageContainer.module.scss';
import ORDLogo from './ORDLogo.png';
import { Breadcrumbs } from '#shell/Breadcrumbs/Breadcrumbs.tsx';
import type { Breadcrumbs as BreadcrumbItems } from './breadcrumbs.ts';
import { Footer } from '#shell/Footer/Footer.tsx';

export interface PageContainerProps extends PropsWithChildren {
  breadcrumbs: BreadcrumbItems;
  badge?: ReactNode;
  /** Controls at the right of the header, such as the signed-in user's menu. */
  headerActions?: ReactNode;
  /** The ord-app commit the host's bundle was built from, which the default footer shows. */
  commit?: string;
  /** The page's footer: the Open Reaction Database footer by default, and none for `null`. */
  footer?: ReactNode;
  /** Where the logo links, such as the host's home page; without it the logo links nowhere. */
  homePath?: string;
}

export function PageContainer({
  children,
  breadcrumbs,
  badge,
  headerActions,
  commit,
  footer = <Footer commit={commit} />,
  homePath,
}: Readonly<PageContainerProps>) {
  const hasFooter = footer !== null;
  const logo = (
    <img
      src={ORDLogo}
      className={classes.logo}
      alt="Open Reaction Database logo"
    />
  );
  return (
    <AppShell
      classNames={{
        root: classes.root,
        header: classes.header,
        main: hasFooter ? classes.main : `${classes.main} ${classes.mainWithoutFooter}`,
        footer: classes.footer,
      }}
    >
      <AppShell.Header>
        {homePath === undefined ? (
          logo
        ) : (
          <Link
            to={homePath}
            className={classes.logoLink}
          >
            {logo}
          </Link>
        )}

        <Group
          gap="xs"
          wrap="nowrap"
        >
          {headerActions}
        </Group>
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

      {hasFooter && <AppShell.Footer withBorder={true}>{footer}</AppShell.Footer>}
    </AppShell>
  );
}
