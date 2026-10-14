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
import { Anchor } from '@mantine/core';
import type { ReactionLinkProps } from '@open-reaction-database/ui/reaction';
import { Link } from 'wouter';

/** Another reaction's ORD ID, linked to its page. */
export function ReactionLink({ pbReactionId }: Readonly<ReactionLinkProps>) {
  return (
    <Anchor
      component={Link}
      href={`/reactions/${encodeURIComponent(pbReactionId)}`}
    >
      {pbReactionId}
    </Anchor>
  );
}
