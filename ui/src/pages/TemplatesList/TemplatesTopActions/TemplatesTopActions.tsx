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
import { PaperButton } from 'common/components/interactions/PaperButton/PaperButton.tsx';
import { colorToCssVariable } from 'common/styling/colors.ts';
import { UploadProgressIcon } from 'common/icons';
import { EnumerateButton } from 'features/enumeration/EnumerateButton.tsx';
import { useDisclosure } from '@mantine/hooks';
import { ImportFromJSON } from 'features/templates/ImportFromJSON/ImportFromJSON.tsx';
import { EnumerationWizard } from 'features/enumeration/EnumerationWizard.tsx';

export function TemplatesTopActions() {
  const [isImportOpened, { open: openImport, close: closeImport }] = useDisclosure();

  return (
    <>
      <Grid
        align="center"
        justify="space-between"
        className=""
      >
        <Grid.Col span={6}>
          <PaperButton
            title="New Template"
            description="Upload JSON file"
            color={colorToCssVariable['purple2']}
            icon={<UploadProgressIcon />}
            onClick={openImport}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <EnumerateButton />
        </Grid.Col>
      </Grid>
      {isImportOpened && <ImportFromJSON onClose={closeImport} />}
      <EnumerationWizard />
    </>
  );
}
