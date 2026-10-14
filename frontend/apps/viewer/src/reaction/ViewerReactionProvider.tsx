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
import {
  createStaticReactionSource,
  ReactionProvider,
} from '@open-reaction-database/ui/reaction';
import { useMemo, type ReactNode } from 'react';
import type { ReactionRecord } from '#api/types.ts';
import { VIEWER_SLOTS } from '#reaction/slots.ts';
import { recordToSnapshot } from '#reaction/snapshot.ts';

interface ViewerReactionProviderProps {
  record: ReactionRecord;
  children: ReactNode;
}

/** Supplies one record, read-only, to the shared reaction view beneath. */
export function ViewerReactionProvider({
  record,
  children,
}: Readonly<ViewerReactionProviderProps>) {
  const source = useMemo(
    () => createStaticReactionSource(recordToSnapshot(record)),
    [record],
  );
  return (
    // The ID is the editor's database ID, which nothing in the shared view reads; the
    // key starts the drawer stack afresh for each reaction.
    <ReactionProvider
      key={record.reaction_id}
      reactionId={0}
      source={source}
      slots={VIEWER_SLOTS}
    >
      {children}
    </ReactionProvider>
  );
}
