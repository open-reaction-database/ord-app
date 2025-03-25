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
import { Grid } from '@mantine/core';
import { AddCircleIcon, ArticleIcon, UploadProgressIcon } from 'common/icons';
import { CreateNewDataset } from 'features/datasets/CreateNewDataset/CreateNewDataset.tsx';
import { useDisclosure } from '@mantine/hooks';
import { CreateDatasetFromFile } from 'features/datasets/CreateDatasetFromFile/CreateDatasetFromFile.tsx';
import { PaperButton } from 'common/components/PaperButton/PaperButton.tsx';
import { colorToCssVariable } from 'common/styling/colors.ts';
import { EnumerationSetup } from 'features/enumeration/EnumerationSetup/EnumerationSetup.tsx';

export function DatasetsListTopActions() {
  const [createNewOpened, { open: openCreateNew, close: closeCreateNew }] = useDisclosure();
  const [createFromFileOpened, { open: openCreateFromFile, close: closeCreateFromFile }] = useDisclosure();
  const [createFromEnumerationOpened, { open: openCreateFromEnumeration, close: closeCreateFromEnumeration }] =
    useDisclosure();

  return (
    <>
      {createNewOpened && <CreateNewDataset onClose={closeCreateNew} />}
      {createFromFileOpened && <CreateDatasetFromFile onClose={closeCreateFromFile} />}
      {createFromEnumerationOpened && <EnumerationSetup onClose={closeCreateFromEnumeration} />}
      <Grid
        align="center"
        justify="space-between"
        className=""
      >
        <Grid.Col span={4}>
          <PaperButton
            title="New Dataset"
            description="Create dataset from scratch"
            color={colorToCssVariable['blue']}
            icon={<AddCircleIcon />}
            onClick={openCreateNew}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <PaperButton
            title="From File"
            description="Create dataset from file"
            color={colorToCssVariable['green']}
            icon={<UploadProgressIcon />}
            onClick={openCreateFromFile}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <PaperButton
            title="Enumerate"
            description="Create dataset from template"
            icon={<ArticleIcon />}
            color={colorToCssVariable['orange']}
            onClick={openCreateFromEnumeration}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
