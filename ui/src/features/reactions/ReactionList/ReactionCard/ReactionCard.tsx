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
import classes from './reactionCard.module.scss';
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { fileDownloadOptions } from 'common/constants.ts';
import { useCallback, useMemo, useRef, useContext } from 'react';
import { typographyClasses } from 'common/styling';
import { ReactionPreview } from '../../ReactionPreview/ReactionPreview.tsx';
import { copyPreviewAsImage } from 'features/reactions/ReactionPreview/reactionPreview.utils.ts';
import { RemoveReaction } from 'features/reactions/RemoveReaction/RemoveReaction.tsx';
import { SaveAsTemplate } from 'features/templates/SaveAsTemplate/SaveAsTemplate.tsx';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';
import { useDisclosure } from '@mantine/hooks';
import { templatesContext } from 'features/templates/templates.context';
import { TemplateHeaderActions } from 'features/templates/TemplateHeaderActions/TemplateHeaderActions.tsx';

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
  id: ReactionId;
  index?: number;
}

export function ReactionCard({ id, index }: Readonly<ReactionCardProps>) {
  const { datasetId } = useParams();
  const { isTemplate } = useContext(templatesContext);
  const reaction = useSelector(selectReactionById(id));
  const previewRef = useRef<HTMLDivElement | null>(null);
  const onPreviewSave = useCallback(() => {
    copyPreviewAsImage(previewRef.current);
  }, [previewRef]);

  const copyToClipboardOptions: Array<CopyButtonOptions> = [
    {
      label: 'Copy Reaction Link',
      value: `${window.location.href}/reactions/${id}`,
    },
    { label: 'Copy Reaction ID', value: id.toString() },
  ];

  const [saveAsTemplateOpened, { open: openSaveAsTemplate, close: closeSaveAsTemplate }] = useDisclosure();
  const linkToPage = isTemplate ? `~/templates/${reaction.id}` : `~/datasets/${datasetId}/reactions/${id}`;
  const isReadyForEnumeration = (reaction.variables?.length ?? 0) > 0;
  console.log('RemoveReaction id', id);

  return (
    <Paper
      className={classes.container}
      radius="sm"
      p="lg"
    >
      {saveAsTemplateOpened && (
        <SaveAsTemplate
          reactionId={reaction.id}
          reactionPbId={reaction.pb_reaction_id}
          onClose={closeSaveAsTemplate}
        />
      )}
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

            {isTemplate ? '' : <CopyButton options={copyToClipboardOptions} />}
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
              <TemplateHeaderActions
                templateId={id}
                isReadyForEnumeration={isReadyForEnumeration}
              />
            </Flex>
          ) : (
            <>
              <Button
                leftSection={<CheckListIcon className={classes.buttonIcon} />}
                variant="transparent"
                onClick={openSaveAsTemplate}
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
