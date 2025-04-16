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
import { Stack } from '@mantine/core';
import { Conditions } from 'features/reactions/ReactionView/Conditions/Conditions';
import { Identifiers } from 'features/reactions/ReactionView/Identifiers/Identifiers';
import { Inputs } from 'features/reactions/ReactionView/Inputs/Inputs';
import { Notes } from 'features/reactions/ReactionView/Notes/Notes';
import { Observation } from 'features/reactions/ReactionView/Observation/Observation';
import { Outcomes } from 'features/reactions/ReactionView/Outcomes/Outcomes';
import { Provenance } from 'features/reactions/ReactionView/Provenance/Provenance';
import { Setup } from 'features/reactions/ReactionView/Setup/Setup';
import { Workups } from 'features/reactions/ReactionView/Workups/Workups';
import React from 'react';
import { ReactionTabs } from './ReactionTabs';

interface ReactionContentProps {
  reactionId: number;
  viewMode: 'tabs' | 'list';
}

export const ReactionContent = React.memo(({ reactionId, viewMode }: Readonly<ReactionContentProps>) => {
  if (viewMode === 'tabs') {
    return <ReactionTabs reactionId={reactionId} />;
  }
  return (
    <Stack gap="xl">
      <Inputs />
      <Outcomes reactionId={reactionId} />
      <Conditions reactionId={reactionId} />
      <Identifiers reactionId={reactionId} />
      <Setup reactionId={reactionId} />
      <Notes />
      <Observation reactionId={reactionId} />
      <Workups />
      <Provenance />
    </Stack>
  );
});

ReactionContent.displayName = 'ReactionContent';
