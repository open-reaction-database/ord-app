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
import { useTimeout } from '@mantine/hooks';
import {
  NotificationVariant,
  showNotification,
} from '@open-reaction-database/ui/display';
import { useState } from 'react';

/** Copies the page's address, which holds everything needed to show it again. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const { start, clear } = useTimeout(() => setCopied(false), 2000);
  const copy = async () => {
    // Read when clicked, so the link is the page as it is then.
    const href = globalThis.location.href;
    try {
      await navigator.clipboard.writeText(href);
      clear();
      setCopied(true);
      start();
    } catch {
      // The browser may refuse, or offer no clipboard outside a secure context; the
      // notification stays until closed, so the address can be copied from it by hand.
      showNotification({
        variant: NotificationVariant.ERROR,
        title: 'The link could not be copied',
        message: href,
        autoClose: false,
      });
    }
  };
  return (
    <Button
      variant="default"
      onClick={() => void copy()}
    >
      {copied ? 'Link copied' : 'Copy link'}
    </Button>
  );
}
