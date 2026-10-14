/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { Button, Flex, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { hashKey, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'wouter';
import { useSearch } from '#api/hooks.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';
import { ReactionResults } from '#components/ReactionResults.tsx';
import { ResultTable } from '#components/ResultTable.tsx';
import { ViewerPage } from '#components/ViewerPage.tsx';
import { compileQuery } from '#search/compile.ts';
import { formFromParams, paramsFromForm, type SearchForm } from '#search/form.ts';
import { SearchFormPanel } from '#search/SearchFormPanel.tsx';

function HelpNote() {
  return (
    <Stack gap={4}>
      <Text
        size="sm"
        fw={600}
      >
        Where answers differ from the old site
      </Text>
      <Text size="sm">
        A reaction SMARTS with several templates on one side returns fewer reactions
        than the old site, since each template has to match a molecule of its own. A
        substructure typed as SMILES is read as SMARTS, which matches the same molecules
        for most patterns but not, for example, a charged or explicit-hydrogen atom. The
        dataset charts count the SMILES the corpus records.
      </Text>
    </Stack>
  );
}

/** The search form beside its results; the URL holds the form, so a search can be linked. */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();
  const search = searchParams.toString();
  const form = useMemo(() => formFromParams(new URLSearchParams(search)), [search]);
  const query = useMemo(() => compileQuery(form), [form]);
  const results = useSearch(query);
  const queryClient = useQueryClient();
  // Submitting the search shown sends again each request on the page that failed, the
  // search or a page of its reactions; what succeeded stays cached. Queries, not URLs,
  // are compared, since more than one URL can hold the same search.
  const runSearch = (next: SearchForm) => {
    const params = paramsFromForm(next).toString();
    if (params !== search) {
      navigate(`/search?${params}`);
    }
    if (hashKey([compileQuery(next)]) === hashKey([query])) {
      void queryClient.refetchQueries({
        type: 'active',
        predicate: cached => cached.state.status === 'error',
      });
    }
  };
  const [showForm, setShowForm] = useState(true);
  let body;
  if (query === null) {
    body = (
      <Text>Set a structure, a reaction SMARTS, a range, or an ID, then search.</Text>
    );
  } else if (results.isError) {
    body = <ErrorNotice error={results.error} />;
  } else if (results.isPending) {
    body = (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  } else if (results.data.kind === 'reactions') {
    body = (
      <ReactionResults
        result={results.data}
        selectionKey={search}
        limit={form.limit}
      />
    );
  } else {
    body = <ResultTable result={results.data} />;
  }
  return (
    <ViewerPage
      breadcrumbs={[
        { title: 'Search', path: search ? `/search?${search}` : '/search' },
      ]}
    >
      <Stack gap="md">
        <Flex
          justify="space-between"
          align="center"
        >
          <Title order={2}>Search</Title>
          <Button
            variant="default"
            onClick={() => setShowForm(shown => !shown)}
          >
            {showForm ? 'Hide the form' : 'Show the form'}
          </Button>
        </Flex>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap="lg"
          // Stacked, the form and results take the page's width rather than their own.
          align={{ base: 'stretch', md: 'flex-start' }}
        >
          {/* Hidden rather than removed, so the form keeps edits not yet searched. */}
          <Paper
            p="md"
            withBorder
            w={{ base: '100%', md: 360 }}
            display={showForm ? undefined : 'none'}
          >
            <Stack gap="md">
              <SearchFormPanel
                // A new URL, such as Back to an earlier search, starts the form afresh.
                key={search}
                initial={form}
                onSearch={runSearch}
              />
              <HelpNote />
            </Stack>
          </Paper>
          <Stack
            gap="md"
            style={{ flex: 1, minWidth: 0 }}
          >
            {body}
          </Stack>
        </Flex>
      </Stack>
    </ViewerPage>
  );
}
