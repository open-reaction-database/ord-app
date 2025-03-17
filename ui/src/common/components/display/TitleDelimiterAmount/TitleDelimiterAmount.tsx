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
import { Title, type TitleProps } from '@mantine/core';
import { DOT_DELIMITER } from 'common/constants.ts';
import type { ReactNode } from 'react';

type TitleOrder = TitleProps['order'];

interface TitleDelimiterAmountProps {
  title: ReactNode;
  amount: number;
  titleOrder?: TitleOrder;
}

export function TitleDelimiterAmount({ title, amount, titleOrder = 3 }: Readonly<TitleDelimiterAmountProps>) {
  return (
    <>
      <Title order={titleOrder}>{title}</Title>
      <span>{DOT_DELIMITER}</span>
      {amount}
    </>
  );
}
