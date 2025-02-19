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
import { Breadcrumbs as MantineBreadcrumbs, Flex, Tooltip } from '@mantine/core';
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
        {/* Cannot be moved to the separate component because otherwise mantine class not being applied (even with forwardRef) */}
        {items.map((breadcrumb, index) => {
          const isActive = index === items.length - 1;

          const children = (
            <>
              {index === 0 && <HomeIcon className={classes.homeIcon} />}
              <Tooltip label={breadcrumb.title}>
                <span className={classes.text}>{breadcrumb.title}</span>
              </Tooltip>
            </>
          );

          return !isActive ? (
            <Link
              className={classes.link}
              to={breadcrumb.path}
              id={breadcrumb.path}
              key={breadcrumb.path}
            >
              {children}
            </Link>
          ) : (
            <Flex>{children}</Flex>
          );
        })}
      </MantineBreadcrumbs>
    </div>
  );
}
