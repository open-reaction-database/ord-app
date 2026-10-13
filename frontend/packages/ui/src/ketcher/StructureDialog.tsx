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
import { Button, Center, Group, Loader, Modal, Text } from '@mantine/core';
import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import type { StructureDialogProps } from './structure.types.ts';

/**
 * Imports the dialog, after installing the Node globals Ketcher's modules read.
 *
 * They are installed here, before the import, rather than by a module imported for its
 * side effects: the package's `sideEffects` lists only stylesheets, so a production build
 * may drop such an import.
 */
async function loadKetcherDialog() {
  const { Buffer } = await import('buffer'); // NOSONAR: the npm polyfill, for browser code; node:buffer is a Node builtin
  globalThis.global ??= globalThis;
  globalThis.Buffer ??= Buffer;
  const { KetcherDialog } = await import('./KetcherDialog.tsx');
  return { default: KetcherDialog };
}

/** A lazy dialog for one attempt to load Ketcher: one that failed keeps its failure. */
function lazyKetcherDialog() {
  return lazy(loadKetcherDialog);
}

interface LoadBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

/** Keeps a failure to load Ketcher, such as a chunk that did not download, in the dialog. */
class LoadBoundary extends Component<Readonly<LoadBoundaryProps>, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Draws a structure in Ketcher, saving it as `format`.
 *
 * Ketcher's chunk loads the first time the dialog opens and is reused by later openings,
 * each of which initializes a new Ketcher in the modal. If the chunk cannot load, the
 * dialog says so and offers to try again, and its host is left as it was.
 */
export function StructureDialog(props: Readonly<StructureDialogProps>) {
  const [hasOpened, setHasOpened] = useState(props.opened);
  const [attempt, setAttempt] = useState(0);
  const [KetcherDialog, setKetcherDialog] = useState(lazyKetcherDialog);
  if (props.opened && !hasOpened) {
    setHasOpened(true);
  }
  if (!hasOpened) {
    return null;
  }
  const tryAgain = () => {
    setKetcherDialog(() => lazyKetcherDialog());
    setAttempt(previous => previous + 1);
  };
  return (
    <LoadBoundary
      key={attempt}
      fallback={
        <Modal
          opened={props.opened}
          onClose={props.onClose}
          title="Draw a structure"
        >
          <Text>Ketcher could not be loaded.</Text>
          <Text
            size="sm"
            c="dimmed"
          >
            Check the connection, then try again.
          </Text>
          <Group
            justify="flex-end"
            mt="md"
          >
            <Button
              variant="default"
              onClick={props.onClose}
            >
              Close
            </Button>
            <Button onClick={tryAgain}>Try again</Button>
          </Group>
        </Modal>
      }
    >
      <Suspense
        fallback={
          <Modal
            opened={props.opened}
            onClose={props.onClose}
            withCloseButton={false}
          >
            <Center p="xl">
              <Loader />
            </Center>
          </Modal>
        }
      >
        <KetcherDialog {...props} />
      </Suspense>
    </LoadBoundary>
  );
}
