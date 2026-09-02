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
import { useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'wouter';
import { ActionIcon, Button, Flex, Input, Paper, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { useSelector } from 'react-redux';
import classes from './templatesList.page.module.scss';
import { selectTemplatesOrder } from 'store/entities/templates/templates.selectors.ts';
import { Counter } from 'common/components/display/Counter/Counter.tsx';
import { EntitiesMenu } from 'features/templates/EntitiesMenu/EntitiesMenu';
import { ReactionCard } from 'common/components/ReactionCard/ReactionCard.tsx';
import { TemplateHeaderActions } from 'features/templates/TemplateHeaderActions/TemplateHeaderActions.tsx';
import {
  selectReactionById,
  selectReactions,
} from 'store/entities/reactions/reactions.selectors.ts';
import { TemplatesTopActions } from './TemplatesTopActions/TemplatesTopActions.tsx';
import { CloseIcon, SearchIcon } from 'common/icons';
import { filterTemplatesByName } from './filterTemplatesByName.ts';
import { highlightNameMatch } from './highlightNameMatch.ts';

interface TemplateTitleProps {
  index: number;
  templateId: string;
  filterQuery: string;
}

function TemplateTitle({
  index,
  templateId,
  filterQuery,
}: Readonly<TemplateTitleProps>) {
  const id = templateId.split('_')[1];
  const linkToPage = `~/templates/${id}`;
  const template = useSelector(selectReactionById(templateId));
  const segments = highlightNameMatch(template?.name ?? '', filterQuery);

  return (
    <>
      <span className={classes.index}>{index}.</span>
      <Link
        className={classes.link}
        to={linkToPage}
      >
        {segments.kind === 'plain' ? (
          segments.text
        ) : (
          <>
            {segments.before}
            <mark className={classes.nameMatch}>{segments.match}</mark>
            {segments.after}
          </>
        )}
      </Link>
    </>
  );
}

export function TemplatesListPage() {
  const templatesOrder = useSelector(selectTemplatesOrder);
  const reactionsById = useSelector(selectReactions);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);

  // Clear is immediate (empty trim); typing waits for debounce before filtering.
  const filterQuery = query.trim() === '' ? '' : debouncedQuery;
  const filteredOrder = useMemo(
    () => filterTemplatesByName(templatesOrder, reactionsById, filterQuery),
    [templatesOrder, reactionsById, filterQuery],
  );
  const showNoMatch =
    filterQuery.trim() !== '' && filteredOrder.length === 0;

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [{ title: 'Templates', path: '~/' }];
  }, []);

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Flex
        direction="column"
        gap="sm"
      >
        <TemplatesTopActions />
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
                  <Counter amount={filteredOrder.length} />
                </Flex>
              </Flex>
            </Paper>
            <Input
              classNames={{
                input: classes.searchInput,
                section: classes.placeholder,
              }}
              value={query}
              onChange={onSearchChange}
              rightSection={
                query ? (
                  <ActionIcon
                    variant="transparent"
                    size="sm"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <CloseIcon />
                  </ActionIcon>
                ) : (
                  <SearchIcon />
                )
              }
              rightSectionPointerEvents={query ? 'all' : 'none'}
              placeholder="Search saved templates"
              aria-label="Search saved templates"
            />
            {showNoMatch ? (
              <Flex
                direction="column"
                align="center"
                gap="sm"
                className={classes.emptyState}
              >
                <Text>No saved templates match your search.</Text>
                <Button
                  variant="subtle"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  Clear search
                </Button>
              </Flex>
            ) : (
              filteredOrder.map((templateId, index) => (
                <ReactionCard
                  key={templateId}
                  id={templateId}
                  actions={<TemplateHeaderActions templateId={templateId} />}
                  title={
                    <TemplateTitle
                      index={index + 1}
                      templateId={templateId}
                      filterQuery={filterQuery}
                    />
                  }
                />
              ))
            )}
          </Flex>
        </div>
      </Flex>
    </PageContainer>
  );
}
