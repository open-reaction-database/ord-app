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
import { Button } from '@mantine/core';
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import { DownloadIcon } from '@open-reaction-database/ui/theme';
import { useState, type ReactNode } from 'react';
import { errorMessage } from '#api/client.ts';
import { downloadReactions } from '#api/download.ts';

interface DownloadButtonProps {
  /** At most 1,000, the backend's bound. */
  reactionIds: ReadonlyArray<string>;
  children?: ReactNode;
}

/** Saves the reactions as one gzipped ord.Dataset, or says why it could not. */
export function DownloadButton({
  reactionIds,
  children = 'Download',
}: Readonly<DownloadButtonProps>) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      await downloadReactions(reactionIds);
    } catch (error) {
      showNotification({
        variant: NotificationVariant.ERROR,
        title: 'The download failed',
        message: errorMessage(error),
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button
      variant="default"
      leftSection={<DownloadIcon />}
      loading={busy}
      disabled={reactionIds.length === 0}
      onClick={() => void download()}
    >
      {children}
    </Button>
  );
}
