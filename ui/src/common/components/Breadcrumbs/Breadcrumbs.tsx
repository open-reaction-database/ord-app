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
import { Anchor, Breadcrumbs as MantineBreadcrumbs, ThemeIcon } from '@mantine/core';
import { IconChevronRight, IconHome } from '@tabler/icons-react';
import classes from './Breadcrumbs.module.scss';

interface Breadcrumb {
  title: string;
  path: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className={classes.container}>
      <ThemeIcon
        variant="white"
        color="primary"
      >
        <IconHome />
      </ThemeIcon>
      <MantineBreadcrumbs
        separator={<IconChevronRight size={18} />}
        separatorMargin={4}
      >
        {items.map((item, index) => {
          return index === items.length - 1 ? (
            <div
              className={classes.active}
              id={item.path}
            >
              {item.title}
            </div>
          ) : (
            <Anchor
              className={classes.link}
              href={item.path}
              id={item.path}
            >
              {item.title}
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </div>
  );
}
