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
import { BarChart } from '@mantine/charts';
import { Flex, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { renderPreviews } from '@open-reaction-database/ui/reaction/previews';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useCompounds } from '#api/hooks.ts';
import type { CompoundCount, CompoundSide } from '#api/types.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';

const IMAGE_SIZE = 160;

interface CompoundTooltipProps {
  smiles: string;
  count: number;
  /** The molecule as a base64 SVG; null or undefined when there is none yet. */
  image: string | null | undefined;
}

/** A bar's molecule, SMILES, and count. */
export function CompoundTooltip({
  smiles,
  count,
  image,
}: Readonly<CompoundTooltipProps>) {
  return (
    <Paper
      p="xs"
      shadow="md"
      withBorder
      maw={IMAGE_SIZE + 40}
    >
      {image && (
        <img
          src={`data:image/svg+xml;base64,${image}`}
          alt={smiles}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
      )}
      <Text
        size="xs"
        style={{ wordBreak: 'break-all' }}
      >
        {smiles}
      </Text>
      <Text size="xs">
        {count.toLocaleString()} {count === 1 ? 'occurrence' : 'occurrences'}
      </Text>
    </Paper>
  );
}

/** The compounds' molecules, rendered together once and keyed by their place. */
function useImages(
  datasetId: string,
  side: CompoundSide,
  compounds: ReadonlyArray<CompoundCount> | undefined,
) {
  return useQuery({
    queryKey: ['compound-images', datasetId, side],
    queryFn: () =>
      renderPreviews(
        Object.fromEntries(
          (compounds ?? []).map((compound, index) => [
            String(index),
            compound.molblock,
          ]),
        ),
        { size: IMAGE_SIZE },
      ),
    enabled: compounds !== undefined && compounds.length > 0,
  });
}

interface CompoundChartProps {
  datasetId: string;
  side: CompoundSide;
  title: string;
}

/**
 * The dataset's 30 most frequent compounds on one side, as bars of their occurrences;
 * hovering a bar shows its molecule.
 */
export function CompoundChart({
  datasetId,
  side,
  title,
}: Readonly<CompoundChartProps>) {
  const compounds = useCompounds(datasetId, side);
  const images = useImages(datasetId, side, compounds.data);
  const data = useMemo(
    () =>
      (compounds.data ?? []).map((compound, index) => ({
        key: String(index),
        smiles: compound.smiles,
        count: compound.count,
      })),
    [compounds.data],
  );
  let body;
  if (compounds.isError) {
    body = <ErrorNotice error={compounds.error} />;
  } else if (compounds.isPending) {
    body = (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  } else if (data.length === 0) {
    body = <Text>No compounds to count.</Text>;
  } else {
    body = (
      <BarChart
        h={280}
        data={data}
        dataKey="smiles"
        series={[{ name: 'count', label: 'Occurrences', color: 'blue.6' }]}
        xAxisProps={{ tick: false }}
        tooltipProps={{
          content: ({ payload }) => {
            const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
            return point ? (
              <CompoundTooltip
                smiles={point.smiles}
                count={point.count}
                image={images.data?.[point.key]}
              />
            ) : null;
          },
        }}
      />
    );
  }
  return (
    <Stack gap="xs">
      <Title order={3}>{title}</Title>
      {body}
    </Stack>
  );
}
