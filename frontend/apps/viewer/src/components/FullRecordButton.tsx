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
import { Button, Code, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMemo } from 'react';
import type { ReactionRecord } from '#api/types.ts';
import { fullRecordJson } from '#reaction/fullRecordJson.ts';

/** Shows the whole reaction as JSON, as ord-interface's Full record did. */
export function FullRecordButton({ record }: Readonly<{ record: ReactionRecord }>) {
  const [opened, { open, close }] = useDisclosure();
  // Decoded only when shown, since most visits never open it.
  const json = useMemo(() => (opened ? fullRecordJson(record) : ''), [opened, record]);
  return (
    <>
      <Button
        variant="default"
        onClick={open}
      >
        Full record
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title={record.reaction_id}
        size="xl"
      >
        <Code block>{json}</Code>
      </Modal>
    </>
  );
}
