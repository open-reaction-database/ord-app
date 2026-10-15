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
import { Button, Flex, Grid, Modal } from '@mantine/core';
import { Editor } from 'ketcher-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';
import type { Ketcher } from 'ketcher-core';
import { useEffect, useState } from 'react';
import { NotificationVariant } from '#display/types/notification.ts';
import { showNotification } from '#display/utils/showNotification.tsx';
import classes from './structureDialog.module.scss';
import type { StructureDialogProps, StructureFormat } from './structure.types.ts';

const appWindow = globalThis as unknown as { ketcher: Ketcher | null };
const structServiceProvider = new StandaloneStructServiceProvider();

const READERS: Record<StructureFormat, (ketcher: Ketcher) => Promise<string>> = {
  molfile: ketcher => ketcher.getMolfile(),
  smiles: ketcher => ketcher.getSmiles(),
  cxsmiles: ketcher => {
    // getMolfile refuses a reaction itself; getSmiles would write reaction SMILES.
    if (ketcher.containsReaction()) {
      throw new Error(
        'The structure cannot be saved as CXSMILES due to reaction arrows.',
      );
    }
    return ketcher.getSmiles(true);
  },
  smarts: ketcher => ketcher.getSmarts(),
};

// CXSMILES fields carrying bonding that Ketcher loads as plain single bonds or drops:
// either way, saving the drawing back would record a different molecule.
const UNREADABLE_FIELDS = [
  { pattern: /[|,]C:\d/, name: 'coordinate bonds' },
  { pattern: /[|,]m:\d/, name: 'multicenter attachments' },
];

/** Returns the names of the fields in a CXSMILES's extension block that Ketcher drops. */
function unreadableFields(structure: string) {
  const extension = /\s(\|.*\|)\s*$/.exec(structure)?.[1] ?? '';
  // Atom labels sit between $ signs and may hold any text, "C:" included.
  const fields = extension.replaceAll(/\$[^$]*\$/g, '');
  return UNREADABLE_FIELDS.filter(({ pattern }) => pattern.test(fields)).map(
    ({ name }) => name,
  );
}

/** Reads the drawing as `format`, refusing one that lost what `initial` held. */
function readDrawing(ketcher: Ketcher, initial: string, format: StructureFormat) {
  const unreadable = unreadableFields(initial);
  if (unreadable.length > 0) {
    throw new Error(
      `Ketcher cannot read the ${unreadable.join(' or ')} in this structure, so saving it would change it.`,
    );
  }
  return READERS[format](ketcher);
}

/** Ketcher's canvas in a modal; StructureDialog loads it the first time it opens. */
export function KetcherDialog({
  opened,
  onClose,
  initial,
  format,
  onSave,
  children,
}: Readonly<StructureDialogProps>) {
  const [ketcher, setKetcher] = useState<Ketcher | null>(null);

  // The modal unmounts Ketcher while closed, and each opening initializes a new one, so
  // the instance is forgotten on close and the next one loads the initial structure.
  useEffect(() => {
    if (!opened) {
      setKetcher(null);
    }
  }, [opened]);

  useEffect(() => {
    if (ketcher) {
      void ketcher.setMolecule(initial);
    }
  }, [ketcher, initial]);

  const handleSave = () => {
    if (!ketcher) {
      return;
    }
    // Read inside then(), so that a getter or guard throwing synchronously and a getter
    // rejecting reach the same handler.
    Promise.resolve()
      .then(() => readDrawing(ketcher, initial, format))
      .then(
        structure => {
          onSave(structure);
          onClose();
        },
        (error: unknown) => {
          showNotification({
            variant: NotificationVariant.ERROR,
            message:
              error instanceof Error
                ? error.message
                : 'The drawing could not be saved.',
          });
        },
      );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      classNames={{ content: classes.wrapper, body: classes.body }}
      withCloseButton={false}
    >
      <div className={classes.editorWrapper}>
        <Editor
          structServiceProvider={structServiceProvider}
          staticResourcesUrl={import.meta.env.BASE_URL as string}
          onInit={instance => {
            setKetcher(instance);
            // Ketcher's own modules read the instance from this global.
            appWindow.ketcher = instance;
          }}
          errorHandler={console.error}
        />
      </div>
      <Grid
        className={classes.actions}
        align="flex-end"
      >
        <Grid.Col span={6}>{children}</Grid.Col>
        <Grid.Col span={6}>
          <Flex
            gap="sm"
            justify="flex-end"
          >
            <Button
              variant="default"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
