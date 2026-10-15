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
import { Button, Flex, Modal, Paper, Popover, Text } from '@mantine/core';
import { Editor } from 'ketcher-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';
import { ChemicalMimeType, parseStruct, type Ketcher } from 'ketcher-core';
import { useEffect, useState } from 'react';
import classes from './structureDialog.module.scss';
import type { StructureDialogProps, StructureFormat } from './structure.types.ts';

const appWindow = globalThis as unknown as { ketcher: Ketcher | null };
const structServiceProvider = new StandaloneStructServiceProvider();

/**
 * The drawing in a line notation, aromatized as Ketcher's Aromatize button would.
 *
 * Ketcher writes a ring as drawn, and a Kekulé ring read as SMARTS has single and double
 * bonds that no aromatic ring matches. Indigo's generic model aromatizes 2-pyridones,
 * purines, and coumarins as RDKit does; its default model leaves them Kekulé.
 */
async function aromatized(ketcher: Ketcher, notation: ChemicalMimeType) {
  const { struct } = await ketcher.structService.aromatize(
    { struct: await ketcher.getKet(), output_format: notation },
    { ...ketcher.editor.serverSettings, 'aromaticity-model': 'generic' },
  );
  return struct;
}

const READERS: Record<StructureFormat, (ketcher: Ketcher) => Promise<string>> = {
  molfile: ketcher => ketcher.getMolfile(),
  smiles: ketcher => aromatized(ketcher, ChemicalMimeType.DaylightSmiles),
  smarts: ketcher => aromatized(ketcher, ChemicalMimeType.DaylightSmarts),
};

function messageOf(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
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
  // Why the last Save could not write the drawing, such as an atom list asked for as SMILES.
  const [failure, setFailure] = useState<string | null>(null);
  // Why Ketcher could not read the initial structure; Save waits for a drawing to replace it.
  const [unreadable, setUnreadable] = useState<string | null>(null);

  // The modal unmounts Ketcher while closed, and each opening initializes a new one, so
  // the instance and any failure are forgotten on close, and the next one loads the
  // initial structure.
  useEffect(() => {
    if (!opened) {
      setKetcher(null);
      setFailure(null);
      setUnreadable(null);
    }
  }, [opened]);

  useEffect(() => {
    if (!ketcher) {
      return;
    }
    let current = true;
    setUnreadable(null);
    // setMolecule leaves the canvas blank when it cannot read a structure and only logs why,
    // so the structure is parsed first, as setMolecule parses it, to keep the reason.
    parseStruct(initial, ketcher.structService, ketcher).then(
      () => {
        if (current) {
          void ketcher.setMolecule(initial);
        }
      },
      (reason: unknown) => {
        if (current) {
          setUnreadable(messageOf(reason));
        }
      },
    );
    return () => {
      current = false;
    };
  }, [ketcher, initial]);

  // A drawing on the blank canvas is what Save replaces the unreadable structure with.
  useEffect(() => {
    if (!ketcher || unreadable === null) {
      return;
    }
    const subscriber: unknown = ketcher.editor.subscribe('change', () => {
      if (!ketcher.editor.struct().isBlank()) {
        setUnreadable(null);
      }
    });
    return () => ketcher.editor.unsubscribe('change', subscriber);
  }, [ketcher, unreadable]);

  const handleSave = () => {
    if (ketcher) {
      setFailure(null);
      void READERS[format](ketcher).then(
        structure => {
          onSave(structure);
          onClose();
        },
        (reason: unknown) => {
          setFailure(messageOf(reason));
        },
      );
    }
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
        {unreadable !== null && (
          <div className={classes.unreadable}>
            <Paper
              role="alert"
              withBorder
              shadow="sm"
              p="sm"
            >
              <Text
                size="sm"
                c="red"
              >
                The structure could not be loaded.
              </Text>
              {/* Indigo's reason can list each notation it tried, so it scrolls. */}
              <Text
                className={classes.reason}
                size="xs"
                c="dimmed"
              >
                {unreadable}
              </Text>
              <Text size="sm">Draw one to replace it, or cancel to keep it.</Text>
            </Paper>
          </div>
        )}
      </div>
      <div className={classes.actions}>
        <div className={classes.fields}>{children}</div>
        <Flex
          className={classes.buttons}
          gap="sm"
        >
          <Button
            variant="default"
            onClick={onClose}
          >
            Cancel
          </Button>
          {/* A popover, since the canvas leaves the buttons no room for a message. */}
          <Popover
            opened={failure !== null}
            onDismiss={() => setFailure(null)}
            position="top-end"
            width="min(24rem, calc(100vw - 2rem))"
            withArrow
          >
            <Popover.Target>
              <Button
                onClick={handleSave}
                disabled={unreadable !== null}
              >
                Save
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text
                role="alert"
                size="sm"
                c="red"
              >
                The drawing could not be saved: {failure}
              </Text>
            </Popover.Dropdown>
          </Popover>
        </Flex>
      </div>
    </Modal>
  );
}
