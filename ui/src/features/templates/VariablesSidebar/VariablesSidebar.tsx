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
import { Anchor, Drawer, Flex } from '@mantine/core';
import { selectIsVariablesSidebarOpened } from 'store/features/variablesSidebar/variablesSidebar.selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback, useMemo } from 'react';
import { setVariablesSidebarOpenedAction } from 'store/features/variablesSidebar/variablesSidebar.actions.ts';
import classes from './variablesSidebar.module.scss';
import { selectTemplateVariablesWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import { reactionFlatPathToSidebars } from 'store/entities/reactions/reactions.utils.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { setReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.actions.ts';

interface VariablesSidebarProps {
  templateId: string;
}

export function VariablesSidebar({ templateId }: Readonly<VariablesSidebarProps>) {
  const dispatch = useAppDispatch();
  const isOpened = useSelector(selectIsVariablesSidebarOpened);

  const onClose = useCallback(() => {
    dispatch(setVariablesSidebarOpenedAction(false));
  }, [dispatch]);

  const variables = useSelector(selectTemplateVariablesWrapper(templateId));

  const variablesList = useMemo(() => {
    const variablesList = Object.values(variables);
    return variablesList.map(variable => ({
      name: variable.name,
      pathComponents: reactionFlatPathToSidebars(variable.path),
    }));
  }, [variables]);

  const onVariableClick = (pathComponentsList: Array<ReactionPathComponents>) => {
    dispatch(setReactionPathComponentsList(pathComponentsList));
  };

  return (
    <Drawer
      opened={isOpened}
      onClose={onClose}
      position="right"
      title="Variables"
      classNames={{ content: classes.sidebar }}
    >
      <Flex
        direction="column"
        gap="xs"
      >
        {variablesList.map(variable => (
          <Anchor
            onClick={() => onVariableClick(variable.pathComponents)}
            key={variable.name}
          >
            @{variable.name}
          </Anchor>
        ))}
      </Flex>
    </Drawer>
  );
}
