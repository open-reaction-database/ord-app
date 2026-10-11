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
import { Conditions } from '#reaction/view/ReactionView/Conditions/Conditions.tsx';
import { Identifiers } from '#reaction/view/ReactionView/Identifiers/Identifiers.tsx';
import { Inputs } from '#reaction/view/ReactionView/Inputs/Inputs.tsx';
import { Notes } from '#reaction/view/ReactionView/Notes/Notes.tsx';
import { Observation } from '#reaction/view/ReactionView/Observation/Observation.tsx';
import { Outcomes } from '#reaction/view/ReactionView/Outcomes/Outcomes.tsx';
import { Provenance } from '#reaction/view/ReactionView/Provenance/Provenance.tsx';
import { Setup } from '#reaction/view/ReactionView/Setup/Setup.tsx';
import { Workups } from '#reaction/view/ReactionView/Workups/Workups.tsx';
import React from 'react';
import { ReactionTabs } from './ReactionTabs.tsx';

interface ReactionContentProps {
  viewMode: 'tabs' | 'list';
}

export const ReactionContent = React.memo(
  ({ viewMode }: Readonly<ReactionContentProps>) => {
    if (viewMode === 'tabs') {
      return <ReactionTabs />;
    }
    return (
      <Stack gap="xl">
        <Inputs />
        <Outcomes />
        <Conditions />
        <Identifiers />
        <Setup />
        <Notes />
        <Observation />
        <Workups />
        <Provenance />
      </Stack>
    );
  },
);

ReactionContent.displayName = 'ReactionContent';
