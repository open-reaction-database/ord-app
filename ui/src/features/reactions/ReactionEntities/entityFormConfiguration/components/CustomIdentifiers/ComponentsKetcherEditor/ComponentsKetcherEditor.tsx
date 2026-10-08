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
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import {
  DEFAULT_STRUCTURE_IDENTIFIER_TYPE,
  isStructureIdentifierType,
  type StructureIdentifierType,
} from 'store/entities/reactions/reactionEntity/structureIdentifiers.ts';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

type IdentifierData = Pick<ReactionCompoundIdentifier, 'value' | 'details'> & {
  type: StructureIdentifierType;
};

interface ComponentsKetcherEditorProps {
  opened: boolean;
  onClose: () => void;
  onSave: (identifier: IdentifierData) => void;
  identifier: ReactionCompoundIdentifier | null;
}

const appWindow = globalThis as unknown as { ketcher: Ketcher | null };

const structServiceProvider = new StandaloneStructServiceProvider();

export function ComponentsKetcherEditor({
  opened,
  onClose,
  identifier,
  onSave,
}: Readonly<ComponentsKetcherEditorProps>) {
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
    // Round-trip the drawing back into whichever structure format the identifier
    // already used; a drawing started from scratch becomes a molblock.
    const type =
      identifier && isStructureIdentifierType(identifier.type)
        ? identifier.type
        : DEFAULT_STRUCTURE_IDENTIFIER_TYPE;
    // `getSmiles` throws synchronously rather than rejecting, so serialize inside an
    // async function to funnel both failure modes into the same catch.
    const serialize = async () =>
      type === 'CXSMILES'
        ? ketcherInstance.getSmiles(true)
        : ketcherInstance.getMolfile();
    serialize()
      .then(value => {
        const details = getValue();
        onSave({ type, value, details });
        onClose();
      })
      .catch((error: unknown) => {
        // Ketcher rejects structures it cannot express in the target format --
        // most commonly a canvas holding a reaction arrow.
        showNotification({
          variant: NotificationVariant.ERROR,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to save the drawn structure.',
        });
        console.error(error);
      });
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
