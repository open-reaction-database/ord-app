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
import { type FC, Fragment } from 'react';
import { Tabs, Tooltip } from '@mantine/core';
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { Inputs } from 'features/reactions/ReactionView/Inputs/Inputs.tsx';
import { Identifiers } from 'features/reactions/ReactionView/Identifiers/Identifiers.tsx';
import { Notes } from 'features/reactions/ReactionView/Notes/Notes.tsx';
import { Outcomes } from 'features/reactions/ReactionView/Outcomes/Outcomes.tsx';
import { Observation } from 'features/reactions/ReactionView/Observation/Observation';
import { Provenance } from 'features/reactions/ReactionView/Provenance/Provenance.tsx';
import { RequiredAsterisk } from 'common/components/display/RequiredAsterisk/RequiredAsterisk.tsx';
import classes from './reactionTabs.module.scss';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface ReactionTab {
  name: string;
  required?: true;
  Component: FC<ReactionViewSectionProps>;
}

const createEmptyComponent = (name: string) => () => name;

const tabs: Array<ReactionTab> = [
  { name: 'inputs', required: true, Component: Inputs },
  { name: 'outcomes', required: true, Component: Outcomes },
  { name: 'conditions', Component: createEmptyComponent('conditions') },
  { name: 'identifiers', Component: Identifiers },
  { name: 'setup', Component: createEmptyComponent('setup') },
  { name: 'notes', Component: Notes },
  { name: 'observations', Component: Observation },
  { name: 'workups', Component: createEmptyComponent('workups') },
  { name: 'provenance', required: true, Component: Provenance },
];

interface TemplateTabsProps {
  reactionId: ReactionId;
}

export function ReactionTabs({ reactionId }: Readonly<TemplateTabsProps>) {
  return (
    <Tabs
      defaultValue={tabs[0].name}
      classNames={{ tab: classes.tabTitle, panel: classes.panel }}
    >
      <Tabs.List>
        {tabs.map(({ name, required }) => (
          <Fragment key={name}>
            {required ? (
              <Tooltip label="Mandatory section">
                <Tabs.Tab value={name}>
                  {name}
                  <RequiredAsterisk />
                </Tabs.Tab>
              </Tooltip>
            ) : (
              <Tabs.Tab value={name}>{name}</Tabs.Tab>
            )}
          </Fragment>
        ))}
      </Tabs.List>
      {tabs.map(({ name, Component }) => (
        <Tabs.Panel
          key={name}
          value={name}
        >
          <Component reactionId={reactionId} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
