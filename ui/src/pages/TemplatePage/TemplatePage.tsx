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
import { useParams } from 'wouter';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { type FC, Fragment, useEffect, useMemo } from 'react';
import { TemplateHeader } from 'features/templates/TemplateHeader/TemplateHeader.tsx';
import { Badge, Flex, Paper, Tabs, Tooltip } from '@mantine/core';
import { useSelector } from 'react-redux';
import classes from './TemplatePage.module.scss';
import { ReactionDetailsSidebar } from 'features/reactions/ReactionDetailsSidebar/ReactionDetailsSidebar.tsx';
import { PageContainer } from 'common/components/PageContainer/PageContainer.tsx';
import type { Breadcrumbs } from 'common/types/breadcrumbs.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { CheckCircleIcon, CrossCircleIcon } from 'common/icons';
import { getTemplate } from 'store/entities/templates/templates.thunks';
import { selectTemplateById } from 'store/entities/templates/templates.selectors.ts';

// test
import type { ReactionViewSectionProps } from 'features/reactions/ReactionView/reactionView.types.ts';
import { Inputs } from 'features/reactions/ReactionView/Inputs/Inputs.tsx';
import { Identifiers } from 'features/reactions/ReactionView/Identifiers/Identifiers.tsx';
// import { Notes } from 'features/reactions/ReactionView/Notes/Notes.tsx';
import { Outcomes } from 'features/reactions/ReactionView/Outcomes/Outcomes.tsx';
import { RequiredAsterisk } from 'common/components/display/RequiredAsterisk/RequiredAsterisk.tsx';

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
  // { name: 'notes', Component: Notes },
  { name: 'observations', Component: createEmptyComponent('observations') },
  { name: 'workups', Component: createEmptyComponent('workups') },
  { name: 'provenance', required: true, Component: createEmptyComponent('provenance') },
];

export function TemplatePage() {
  const dispatch = useAppDispatch();
  const { templateId: rawTemplateId } = useParams<{ templateId: string }>();
  const templateId = parseInt(rawTemplateId);
  const template = useSelector(selectTemplateById(templateId));

  const breadcrumbs = useMemo((): Breadcrumbs => {
    return [
      { title: 'Templates', path: '~/templates' },
      {
        path: `~/templates/${templateId}`,
        title: template?.name ?? templateId.toString(),
      },
    ];
  }, [templateId, template?.name]);

  useEffect(() => {
    dispatch(getTemplate(templateId));
  }, [dispatch, templateId]);

  const contextValue = useMemo(
    () => ({
      reactionId: templateId,
      isTemplate: true,
      pathComponents: [],
    }),
    [templateId],
  );
  const CheckIcon = <CheckCircleIcon className={classes.checkIcon} />;
  const CrossIcon = <CrossCircleIcon className={classes.crossIcon} />;
  const variables = template?.variables ?? '[]';
  const isReadyForEnumeration = variables.length > 0;
  const templateBadge = (
    <Badge
      autoContrast
      className={classes.templateBadge}
    >
      Template
    </Badge>
  );

  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
      badge={templateBadge}
    >
      <reactionEntityContext.Provider value={contextValue}>
        {template && (
          <Flex
            direction="column"
            gap="sm"
            miw={50}
          >
            <Badge
              variant="outline"
              size="lg"
              radius="md"
              leftSection={!isReadyForEnumeration ? CheckIcon : CrossIcon}
              className={classes.enumerationBadge}
            >
              {!isReadyForEnumeration ? 'Template is valid' : 'Not Ready for Enumeration: No Variables'}
            </Badge>
            <TemplateHeader
              isReadyForEnumeration={!isReadyForEnumeration}
              templateId={templateId}
            />
            <Paper
              radius="md"
              p="lg"
            >
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
                    <Component reactionId={templateId} />
                  </Tabs.Panel>
                ))}
              </Tabs>
            </Paper>
            <ReactionDetailsSidebar reactionId={templateId} />
          </Flex>
        )}
      </reactionEntityContext.Provider>
    </PageContainer>
  );
}
