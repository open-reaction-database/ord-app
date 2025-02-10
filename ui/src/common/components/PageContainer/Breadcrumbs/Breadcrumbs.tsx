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
import { Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';
import { Link } from 'wouter';
import classes from './Breadcrumbs.module.scss';
import { HomeIcon } from 'common/icons';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';

interface BreadcrumbsProps {
  items: Breadcrumbs;
}

export function Breadcrumbs({ items }: Readonly<BreadcrumbsProps>) {
  return (
    <div className={classes.container}>
      <MantineBreadcrumbs
        separator="/"
        separatorMargin={6}
        classNames={{
          separator: classes.separator,
          breadcrumb: classes.breadcrumb,
        }}
      >
        {items.map((item, index) => {
          const isActive = index === items.length - 1;
          return (
            <Link
              className={isActive ? classes.active : classes.link}
              to={item.path}
              id={item.path}
              key={item.path}
            >
              {index === 0 && <HomeIcon className={classes.homeIcon} />}
              {item.title}
            </Link>
          );
        })}
      </MantineBreadcrumbs>
    </div>
  );
}
