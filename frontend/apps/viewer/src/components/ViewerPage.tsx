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
import { Anchor, Group } from '@mantine/core';
import { PageContainer, type Breadcrumbs } from '@open-reaction-database/ui/shell';
import type { PropsWithChildren } from 'react';
import { Link } from 'wouter';

export const EDITOR_URL = 'https://app.open-reaction-database.org';
export const DOCS_URL = 'https://docs.open-reaction-database.org';

interface ViewerPageProps extends PropsWithChildren {
  breadcrumbs: Breadcrumbs;
}

function Navigation() {
  return (
    <nav aria-label="Main">
      <Group gap="lg">
        <Anchor
          component={Link}
          href="/"
        >
          Browse
        </Anchor>
        <Anchor
          component={Link}
          href="/search"
        >
          Search
        </Anchor>
        <Anchor href={EDITOR_URL}>Contribute</Anchor>
        <Anchor href={DOCS_URL}>Docs</Anchor>
        <Anchor
          component={Link}
          href="/about"
        >
          About
        </Anchor>
      </Group>
    </nav>
  );
}

/** The page shell, with the viewer's navigation in its header. */
export function ViewerPage({ breadcrumbs, children }: Readonly<ViewerPageProps>) {
  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
      headerActions={<Navigation />}
    >
      {children}
    </PageContainer>
  );
}
