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
import { Anchor, List, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { ViewerPage } from '#components/ViewerPage.tsx';

const GOVERNING_COMMITTEE = [
  'Connor Coley (MIT, C-CAS)',
  'Abby Doyle (UCLA, C-CAS)',
  'Spencer Dreher (Merck)',
  'Joel Hawkins (Pfizer)',
  'Klavs Jensen (MIT)',
  'Steven Kearnes (Genesis)',
];

const ADVISORY_BOARD = [
  'Alán Aspuru-Guzik (Toronto, MADNESS)',
  'Timothy Cernak (Michigan, Entos)',
  'Lucy Colwell (Cambridge, SynTech, Google)',
  'Werngard Czechtizky (AstraZeneca)',
  'JW Feng',
  'Matthew Gaunt (Cambridge, SynTech)',
  'Alex Godfrey (NCATS Consultant)',
  'Mimi Hii (Imperial, ROAR)',
  'Greg Landrum (T5 Informatics)',
  'Fabio Lima (Novartis)',
  'Christos Nicolaou (Recursion)',
  'Sarah Reisman (Caltech, C-CAS)',
  'Francesco Rianjongdee (GSK)',
  'Marwin Segler (Microsoft)',
  'Matthew Sigman (Utah, C-CAS)',
  'Jay Stevens (BMS)',
  'Sarah Trice (XtalPi)',
  'Huimin Zhao (UIUC, MMLI)',
];

const SUPPORTERS = [
  'Google',
  'Relay Therapeutics',
  'Schmidt Futures',
  'University of Notre Dame',
];

const NEWS = [
  {
    title: 'A new database for machine-learning research',
    outlet: 'C&EN',
    date: '22 November 2021',
    href: 'https://cen.acs.org/physical-chemistry/computational-chemistry/new-database-machine-learning-research/99/web/2021/11',
  },
  {
    title: 'Yield-predicting AI needs chemists to stop ignoring failed experiments',
    outlet: 'Chemistry World',
    date: '12 May 2022',
    href: 'https://www.chemistryworld.com/news/yield-predicting-ai-needs-chemists-to-stop-ignoring-failed-experiments/4015662.article',
  },
  {
    title:
      'Chemists debate machine learning’s future in synthesis planning and ask for open data',
    outlet: 'C&EN',
    date: '18 May 2022',
    href: 'https://cen.acs.org/physical-chemistry/computational-chemistry/Chemists-debate-machine-learnings-future/100/i18',
  },
  {
    title: 'For chemists, the AI revolution has yet to happen',
    outlet: 'Nature',
    date: '17 May 2023',
    href: 'https://www.nature.com/articles/d41586-023-01612-x',
  },
];

function Section({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 4 }}
      spacing="lg"
    >
      <Title order={3}>{title}</Title>
      <Stack
        gap="sm"
        style={{ gridColumn: 'span 3' }}
      >
        {children}
      </Stack>
    </SimpleGrid>
  );
}

function Names({ names }: Readonly<{ names: Array<string> }>) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {names.map(name => (
        <Text key={name}>{name}</Text>
      ))}
    </SimpleGrid>
  );
}

export function AboutPage() {
  return (
    <ViewerPage breadcrumbs={[{ title: 'About', path: '/about' }]}>
      <Stack gap="xl">
        <Section title="About">
          <Text>
            The Open Reaction Database (ORD) is an open-access schema and infrastructure
            for structuring and sharing organic reaction data, including a centralized
            data repository. The ORD schema supports conventional and emerging
            technologies, from benchtop reactions to automated high-throughput
            experiments and flow chemistry. Our vision is that a consistent data
            representation and infrastructure to support data sharing will enable
            downstream applications that will greatly improve the state of the art with
            respect to computer-aided synthesis planning, reaction prediction, and other
            predictive chemistry tasks.
          </Text>
          <Text>
            Since our initial meeting in October 2019, the database has grown to include
            more than 2M reactions (including a large dataset of reactions extracted
            from USPTO sources) and received contributions from academic and industrial
            users, both from published and unpublished work. Some of our current efforts
            include:
          </Text>
          <List>
            <List.Item>
              Improving user interfaces and providing support to contributors on GitHub
              and via email.
            </List.Item>
            <List.Item>
              Working with companies to incorporate the ORD schema into their reaction
              informatics infrastructure, including the development of
              &quot;translators&quot; between the ORD schema and electronic lab
              notebooks (ELNs).
            </List.Item>
            <List.Item>
              Engaging with journals and other stakeholders to drive adoption of the ORD
              schema as a{' '}
              <Anchor href="https://en.wikipedia.org/wiki/FAIR_data">FAIR</Anchor> data
              structure for sharing reaction data across academia, government, and
              industry.
            </List.Item>
          </List>
          <Text>
            <Anchor href="https://www.linkedin.com/in/benjamin-deadman-78786242/">
              Ben Deadman
            </Anchor>{' '}
            is our Reaction Data Evangelist and ORD Program Manager. Please reach out to
            him at{' '}
            <Anchor href="mailto:help@open-reaction-database.org">
              help@open‑reaction‑database.org
            </Anchor>{' '}
            for help preparing a contribution or to discuss using the ORD in your
            company or lab.
          </Text>
        </Section>
        <Section title="Publications and Media">
          <Title order={4}>Journal Articles</Title>
          <List>
            <List.Item>
              Kearnes SM, Maser MR, Wleklinski M, Kast A, Doyle AG, Dreher SD, Hawkins
              JM, Jensen KF, Coley CW. The Open Reaction Database.{' '}
              <em>J Am Chem Soc</em> 2021, 143(45), 18820-18826. (
              <Anchor href="https://doi.org/10.1021/jacs.1c09820">JACS</Anchor>)
            </List.Item>
            <List.Item>
              Mercado R, Kearnes SM, Coley C. Data Sharing in Chemistry: Lessons Learned
              and a Case for Mandating Structured Reaction Data.{' '}
              <em>J Chem Inf Model</em> 2023, 63(14), 4253-4265. (
              <Anchor href="https://doi.org/10.1021/acs.jcim.3c00607">JCIM</Anchor>)
            </List.Item>
          </List>
          <Title order={4}>News</Title>
          <List>
            {NEWS.map(item => (
              <List.Item key={item.href}>
                {item.title} (<Anchor href={item.href}>{item.outlet}</Anchor>,{' '}
                {item.date})
              </List.Item>
            ))}
          </List>
        </Section>
        <Section title="Leadership">
          <Title order={4}>Governing Committee</Title>
          <Names names={GOVERNING_COMMITTEE} />
          <Title order={4}>Advisory Board</Title>
          <Names names={ADVISORY_BOARD} />
        </Section>
        <Section title="Support">
          <Text>We gratefully acknowledge support from:</Text>
          <List>
            {SUPPORTERS.map(supporter => (
              <List.Item key={supporter}>{supporter}</List.Item>
            ))}
          </List>
        </Section>
      </Stack>
    </ViewerPage>
  );
}
