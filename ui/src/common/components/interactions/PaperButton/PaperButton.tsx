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
import classes from './paperIcon.module.scss';
import { Button, type ButtonProps } from '@mantine/core';
import type { JSX } from 'react';

interface PaperButtonProps extends Omit<ButtonProps, 'classNames' | 'children'> {
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  onClick?: () => void;
}

export function PaperButton({ title, description, icon, color, ...props }: Readonly<PaperButtonProps>) {
  return (
    <Button
      variant="default"
      style={{ '--paper-button-color': color }}
      leftSection={icon}
      classNames={{
        root: classes.root,
        inner: classes.inner,
        label: classes.label,
        section: classes.section,
      }}
      {...props}
    >
      <span>{title}</span>
      <span className={classes.subtitle}>{description}</span>
    </Button>
  );
}
