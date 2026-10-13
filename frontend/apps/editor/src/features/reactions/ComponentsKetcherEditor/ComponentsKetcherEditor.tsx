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
import { Button, Flex, Grid, Modal, TextInput } from '@mantine/core';
import { Editor } from 'ketcher-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';
import classes from './componentsKetcherEditor.module.scss';
import type { Ketcher } from 'ketcher-core';
import { useEffect, useState } from 'react';
import { useField } from '@mantine/form';
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import type { MoleculeEditorProps } from '@open-reaction-database/ui/reaction';
import { DEFAULT_STRUCTURE_IDENTIFIER_TYPE } from '@open-reaction-database/ui/reaction/model';

const appWindow = globalThis as unknown as { ketcher: Ketcher | null };

const structServiceProvider = new StandaloneStructServiceProvider();

/** Returns whether a CXSMILES's extension block records coordinate bonds (`C:`). */
function hasCoordinateBonds(cxsmiles: string) {
  const extension = /\s(\|.*\|)\s*$/.exec(cxsmiles)?.[1] ?? '';
  // Atom labels sit between $ signs and may hold any text, "C:" included.
  return /[|,]C:\d/.test(extension.replaceAll(/\$[^$]*\$/g, ''));
}

export function ComponentsKetcherEditor({
  opened,
  onClose,
  identifier,
  onSave,
}: Readonly<MoleculeEditorProps>) {
  const [ketcherInstance, setKetcherInstance] = useState<Ketcher | null>(null);
  const initialValue = identifier?.details || 'Drawn with Ketcher';
  const { getInputProps, getValue, setValue } = useField({
    mode: 'controlled',
    initialValue: initialValue,
  });

  useEffect(() => {
    setValue(initialValue);
  }, [setValue, initialValue]);

  useEffect(() => {
    if (ketcherInstance && identifier) {
      ketcherInstance.setMolecule(identifier.value ?? '');
    }
  }, [identifier, ketcherInstance]);

  useEffect(() => {
    if (ketcherInstance && !opened) {
      ketcherInstance.setMolecule('');
    }
  }, [ketcherInstance, opened]);

  const handleSave = () => {
    if (!ketcherInstance) {
      return;
    }
    // The drawing goes back in the type it was opened in; a new one is a molblock.
    const type = identifier?.type ?? DEFAULT_STRUCTURE_IDENTIFIER_TYPE;
    // An async function, so that getSmiles throwing synchronously and getMolfile
    // rejecting reach the same catch.
    const serialize = async () => {
      if (type !== 'CXSMILES') {
        return ketcherInstance.getMolfile();
      }
      // Ketcher loads coordinate bonds as single bonds, so a dative N->Pt would save as
      // an N-Pt single bond with one hydrogen fewer on the N.
      if (hasCoordinateBonds(identifier?.value ?? '')) {
        throw new Error(
          'Ketcher cannot read the coordinate bonds in this CXSMILES, so saving it would change the structure.',
        );
      }
      // getSmiles would write a reaction SMILES into a compound identifier.
      if (ketcherInstance.containsReaction()) {
        throw new Error(
          'The structure cannot be saved as CXSMILES due to reaction arrows.',
        );
      }
      return ketcherInstance.getSmiles(true);
    };
    serialize().then(
      value => {
        onSave({ type, value, details: getValue() });
        onClose();
      },
      (error: unknown) => {
        showNotification({
          variant: NotificationVariant.ERROR,
          message:
            error instanceof Error ? error.message : 'The drawing could not be saved.',
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
          onInit={ketcher => {
            setKetcherInstance(ketcher);
            // Ketcher EXPECTS global object to have ketcher variable, otherwise it won't work
            appWindow.ketcher = ketcher;
          }}
          errorHandler={console.error}
        />
      </div>
      <Grid
        className={classes.actions}
        align="flex-end"
      >
        <Grid.Col span={6}>
          <TextInput
            placeholder="Details"
            label="Details"
            {...getInputProps()}
          />
        </Grid.Col>
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
