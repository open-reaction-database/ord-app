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
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useEffect, useMemo } from 'react';
import { Flex, Paper, Title } from '@mantine/core';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { useSelector } from 'react-redux';
import classes from './templatesList.page.module.scss';
import { getAllTemplates } from 'store/entities/templates/templates.thunks';
import { selectTemplates } from 'store/entities/templates/templates.selectors.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { EntitiesMenu } from 'features/templates/EntitiesMenu/EntitiesMenu';
import { ReactionCard } from 'features/reactions/ReactionList/ReactionCard/ReactionCard.tsx';

export function TemplatesListPage() {
  const dispatch = useAppDispatch();
  const templates = Object.values(useSelector(selectTemplates));
  const contextValue = useMemo(
    () => ({
      reactionId: 0,
      isTemplate: true,
      pathComponents: [],
    }),
    [],
  );

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [{ title: 'Templates', path: '~/' }];
  }, []);

  useEffect(() => {
    dispatch(getAllTemplates());
  }, [dispatch]);

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <reactionEntityContext.Provider value={contextValue}>
        <div className={classes.container}>
          <EntitiesMenu />
          <Flex
            direction="column"
            gap="sm"
            className={classes.templates}
          >
            <Paper
              radius="sm"
              p="lg"
            >
              <Flex justify="space-between">
                <Flex
                  align="center"
                  gap="sm"
                >
                  <Title order={2}>Templates</Title>
                  <Counter amount={templates.length} />
                </Flex>
              </Flex>
            </Paper>
            <>
              {templates.map(template => (
                <ReactionCard
                  key={template.id}
                  id={`template_${template.id}`}
                />
              ))}
            </>
          </Flex>
        </div>
      </reactionEntityContext.Provider>
    </PageContainer>
  );
}
