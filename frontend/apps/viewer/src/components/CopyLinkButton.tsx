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
import { useClipboard } from '@mantine/hooks';

/** Copies the page's address, which holds everything needed to show it again. */
export function CopyLinkButton() {
  const clipboard = useClipboard();
  return (
    <Button
      variant="default"
      // Read when clicked, so the link is the page as it is then.
      onClick={() => clipboard.copy(globalThis.location.href)}
    >
      {clipboard.copied ? 'Link copied' : 'Copy link'}
    </Button>
  );
}
