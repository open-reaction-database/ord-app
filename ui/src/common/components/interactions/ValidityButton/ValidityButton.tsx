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
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';
import classes from './validityButton.module.scss';
import { Badge, Button } from '@mantine/core';

interface ValidityButtonProps {
  isValid: boolean;
  validText: string;
  invalidText: string;
  onClick: () => void;
  isNotClickable?: boolean;
}

export function ValidityButton({
  isValid,
  validText,
  invalidText,
  onClick,
  isNotClickable,
}: Readonly<ValidityButtonProps>) {
  return isNotClickable ? (
    <Badge
      variant="outline"
      size="lg"
      radius="md"
      classNames={{ root: classes.button, section: classes.section, label: classes.label }}
      leftSection={isValid ? <CheckCircleIcon /> : <CrossCircleIcon />}
    >
      {isValid ? validText : invalidText}
    </Badge>
  ) : (
    <Button
      variant="outline"
      size="lg"
      radius="md"
      onClick={onClick}
      leftSection={isValid ? <CheckCircleIcon /> : <CrossCircleIcon />}
      classNames={{ root: classes.button, section: classes.section, label: classes.label }}
      className={classes.enumerationBadge}
    >
      {isValid ? validText : invalidText}
    </Button>
  );
}
