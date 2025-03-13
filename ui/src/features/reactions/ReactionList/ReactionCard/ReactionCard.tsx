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
import { Button, Flex, Paper, Title } from '@mantine/core';
import { Link, useParams } from 'wouter';
import { CopyButton, type CopyButtonOptions } from 'common/components/interactions/CopyButton/CopyButton.tsx';
import { CheckListIcon, ChevronDownIcon, CopyImageIcon, DownloadIcon } from 'common/icons';
import { DownloadMenu } from 'common/components/DownloadMenu/DownloadMenu.tsx';
import classes from './ReactionCard.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { fileDownloadOptions } from 'common/constants.ts';
import { useCallback, useMemo, useRef } from 'react';
import { typographyClasses } from 'common/styling';
import { ReactionPreview } from '../../ReactionPreview/ReactionPreview.tsx';
import { copyPreviewAsImage } from 'features/reactions/ReactionPreview/reactionPreview.utils.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { TemplateHeader } from 'features/templates/TemplateHeader/TemplateHeader.tsx';

interface DescriptorsListProps {
  title: string;
  items: Record<string, string | number>;
}

function DescriptorsList({ title, items }: Readonly<DescriptorsListProps>) {
  const itemsArray = useMemo(() => Object.entries(items), [items]);

  return (
    <div>
      <Title
        className={typographyClasses.secondary2}
        order={4}
      >
        {title}:
      </Title>
      <Flex gap="xs">
        {itemsArray.map(([key, value], index) => (
          <Flex
            key={key}
            gap="xs"
          >
            <span className={classes.infoTitle}>{key}: </span>
            <span>{value}</span>
            {index !== itemsArray.length - 1 && <span>&middot;</span>}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

interface ReactionCardProps {
  id: number | string;
  index?: number;
}

export function ReactionCard({ id, index }: Readonly<ReactionCardProps>) {
  const { datasetId } = useParams();
  const reaction = useSelector(selectReactionById(id));
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isTemplate = id.toString().startsWith('template_');

  const onPreviewSave = useCallback(() => {
    copyPreviewAsImage(previewRef.current);
  }, [previewRef]);

  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    {
      label: 'Copy Link',
      value: isTemplate ? `${window.location.href}/${reaction.id}` : `${window.location.href}/reactions/${id}`,
    },
    { label: 'Copy ID', value: id.toString() },
  ];

  const isReadyForEnumeration = false;
  const linkToPage = isTemplate ? `~/templates/${reaction.id}` : `~/datasets/${datasetId}/reactions/${id}`;

  return (
    <Paper
      className={classes.container}
      radius="sm"
      p="lg"
    >
      <div className={classes.topContainer}>
        <div className={classes.titleContainer}>
          <Flex
            align="center"
            gap="4"
          >
            {isTemplate ? '' : <span className={classes.index}>{index}.</span>}
            <Link
              className={classes.link}
              to={linkToPage}
            >
              {isTemplate ? `${reaction.name}` : `${reaction.pb_reaction_id}`}
            </Link>

            <CopyButton options={copyToClipboardOptions} />
          </Flex>

          <DescriptorsList
            title="Provenance"
            items={reaction.summary.provenance}
          />
        </div>
        <Flex
          align="flex-start"
          justify="flex-end"
          className={classes.buttonContainer}
        >
          <RemoveReaction reactionId={id} />
          {isTemplate ? (
            <Flex
              align="center"
              gap="sm"
            >
              <TemplateHeader
                templateId={id}
                isReadyForEnumeration={isReadyForEnumeration}
              />
            </Flex>
          ) : (
            <>
              <Button
                leftSection={<CheckListIcon className={classes.buttonIcon} />}
                variant="transparent"
              >
                Save as a Template
              </Button>

              <Button
                onClick={onPreviewSave}
                variant="transparent"
                leftSection={<CopyImageIcon className={classes.buttonIcon} />}
              >
                Copy reaction image
              </Button>

              <DownloadMenu
                options={fileDownloadOptions}
                url={`/datasets/${datasetId}/reactions/${id}/download`}
                target={
                  <Button
                    className={classes.target}
                    leftSection={<DownloadIcon />}
                    rightSection={<ChevronDownIcon />}
                    variant="transparent"
                  >
                    Download Reaction
                  </Button>
                }
              />
            </>
          )}
        </Flex>
      </div>
      <ReactionPreview
        reaction={reaction}
        reactionId={id}
        ref={previewRef}
      />
      <DescriptorsList
        title="Summary"
        items={reaction.summary.summary}
      />
    </Paper>
  );
}
