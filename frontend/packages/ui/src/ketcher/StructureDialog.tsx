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
import { Center, Loader, Modal } from '@mantine/core';
import { lazy, Suspense, useState } from 'react';
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

const KetcherDialog = lazy(loadKetcherDialog);

/**
 * Draws a structure in Ketcher, saving it as `format`.
 *
 * Ketcher loads the first time the dialog opens, in a chunk of its own, and stays mounted
 * after the dialog closes, so later openings are immediate.
 */
export function StructureDialog(props: Readonly<StructureDialogProps>) {
  const [hasOpened, setHasOpened] = useState(props.opened);
  if (props.opened && !hasOpened) {
    setHasOpened(true);
  }
  if (!hasOpened) {
    return null;
  }
  return (
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
  );
}
