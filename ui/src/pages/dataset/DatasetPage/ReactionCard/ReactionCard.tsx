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
import { Button, Paper } from '@mantine/core';
import classes from './ReactionCard.module.scss';
import { Link } from 'wouter';
import { IconChecklist, IconChevronDown, IconDots, IconDownload } from '@tabler/icons-react';
import { Reaction } from '../../../../common/model/reaction';

interface ReactionCardProps {
  reaction: Reaction;
  index: number;
}

export function ReactionCard({ reaction, index }: Readonly<ReactionCardProps>) {
  const { id, name, summary, conditions, analysis } = reaction;

  return (
    <Paper
      className={classes.container}
      radius="sm"
      p="lg"
    >
      <div className={classes.topContainer}>
        <div className={classes.titleContainer}>
          <div>
            <span className={classes.index}>{index}.</span>
            <Link
              className={classes.link}
              to={'/dataset/123/reaction/123'}
            >
              {name ?? id}
            </Link>
          </div>

          <div>
            <span className={classes.summaryTitle}>Provenance Summary: </span>
            <span className={classes.summary}>{summary}</span>
          </div>
        </div>

        <div className={classes.buttonContainer}>
          <Button
            leftSection={<IconChecklist size={20} />}
            variant="white"
          >
            Save as a Template
          </Button>

          <Button
            leftSection={<IconDownload size={20} />}
            rightSection={<IconChevronDown size={20} />}
            variant="white"
          >
            Download Reaction
          </Button>

          <Button
            leftSection={<IconDots size={20} />}
            variant="white"
          >
            More
          </Button>
        </div>
      </div>

      <div>Reaction Field</div>

      <div>
        <span className={classes.infoTitle}>Conditions: </span>
        {conditions} &middot;
        <span className={classes.infoTitle}> Analysis: </span>
        {analysis}
      </div>
    </Paper>
  );
}
