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
import { Anchor, Burger, Group, Menu } from '@mantine/core';
import { PageContainer, type Breadcrumbs } from '@open-reaction-database/ui/shell';
import { useState, type PropsWithChildren } from 'react';
import { Link } from 'wouter';

export const EDITOR_URL = 'https://app.open-reaction-database.org';
export const DOCS_URL = 'https://docs.open-reaction-database.org';

interface ViewerPageProps extends PropsWithChildren {
  breadcrumbs: Breadcrumbs;
}

/** The header's links: the viewer's own pages route in the app, the rest leave it. */
const LINKS: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
  { label: 'Browse', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Contribute', href: EDITOR_URL, external: true },
  { label: 'Docs', href: DOCS_URL, external: true },
  { label: 'About', href: '/about' },
];

/** The links in a menu behind a button, for screens too narrow to show them in a row. */
function NavigationMenu() {
  const [opened, setOpened] = useState(false);
  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
    >
      <Menu.Target>
        <Burger
          opened={opened}
          size="sm"
          hiddenFrom="sm"
          aria-label="Navigation menu"
        />
      </Menu.Target>
      <Menu.Dropdown>
        {LINKS.map(({ label, href, external }) =>
          external ? (
            <Menu.Item
              key={label}
              component="a"
              href={href}
            >
              {label}
            </Menu.Item>
          ) : (
            <Menu.Item
              key={label}
              component={Link}
              href={href}
            >
              {label}
            </Menu.Item>
          ),
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

function Navigation() {
  return (
    <nav aria-label="Main">
      <Group
        gap="lg"
        wrap="nowrap"
        visibleFrom="sm"
      >
        {LINKS.map(({ label, href, external }) =>
          external ? (
            <Anchor
              key={label}
              href={href}
            >
              {label}
            </Anchor>
          ) : (
            <Anchor
              key={label}
              component={Link}
              href={href}
            >
              {label}
            </Anchor>
          ),
        )}
      </Group>
      <NavigationMenu />
    </nav>
  );
}

/**
 * The page shell, with the viewer's navigation in its header and the commit it was built
 * from in its footer.
 */
export function ViewerPage({ breadcrumbs, children }: Readonly<ViewerPageProps>) {
  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
      headerActions={<Navigation />}
      commit={import.meta.env.VITE_GIT_COMMIT as string | undefined}
    >
      {children}
    </PageContainer>
  );
}
