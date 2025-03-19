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
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import { Title, Text, Button, Flex } from '@mantine/core';
import { navigate } from 'wouter/use-browser-location';
import { HomeIcon } from 'common/icons';
import classes from './notFoundPage.module.scss';
import type { RejectValue } from 'store/utils/handleApiError';

interface NotFoundPageProps {
  rejectValue?: RejectValue;
}

export function NotFoundPage({ rejectValue }: Readonly<NotFoundPageProps>) {
  const errorCode = rejectValue?.errorCode ?? 404;
  const errorMessage = rejectValue?.errorMessage ?? 'The requested page or resource could not be found';
  return (
    <PageContainer breadcrumbs={[]}>
      <Flex className={classes.container}>
        <Title
          order={1}
          className={classes.title}
        >
          {errorCode}
        </Title>
        <Text
          size="lg"
          className={classes.text}
        >
          {errorMessage}
        </Text>
        <Button
          mt="lg"
          className={classes.button}
          onClick={() => navigate('/datasets')}
        >
          <HomeIcon className={classes.homeIcon} />
          Go to Datasets Page
        </Button>
      </Flex>
    </PageContainer>
  );
}
