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
import { HomeIcon } from '#theme/icons/index.ts';
import type { Breadcrumbs } from '#shell/breadcrumbs.ts';

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
        {/* Mantine clones each crumb to add its class, so a crumb component would have to pass on `className`. */}
        {/* The clones are keyed by position, so two crumbs may share a path. */}
        {items.map((breadcrumb, index) => {
          const isActive = index === items.length - 1;

          const children = (
            <>
              {index === 0 && (
                <HomeIcon
                  className={classes.homeIcon}
                  aria-hidden
                />
              )}
              <Tooltip label={breadcrumb.title}>
                <span className={classes.text}>{breadcrumb.title}</span>
              </Tooltip>
            </>
          );

          return !isActive ? (
            <Link
              className={classes.link}
              to={breadcrumb.path}
              key={breadcrumb.path}
            >
              {children}
            </Link>
          ) : (
            <Flex key={breadcrumb.path}>{children}</Flex>
          );
        })}
      </MantineBreadcrumbs>
    </div>
  );
}
