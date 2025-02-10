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
import classes from './editSidebar.module.scss';
import { Drawer } from '@mantine/core';
import { memo, useCallback } from 'react';
import { SidebarForm } from './SidebarForm/SidebarForm.tsx';
import { useSelector } from 'react-redux';
import { selectReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.selectors.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import {
  clearReactionPathComponentsList,
  popReactionPathComponents,
} from 'store/features/reactionForm/reactionForm.actions.ts';
import { useSidebarInfo } from 'common/hooks/useSidebarInfo.tsx';

interface EditSidebarProps {
  reactionId: number;
}

function ReactionDetailsSidebarComponent({ reactionId }: Readonly<EditSidebarProps>) {
  const dispatch = useAppDispatch();
  const reactionPathComponentsList = useSelector(selectReactionPathComponentsList);

  const [currentSidebar] = reactionPathComponentsList.reverse();

  const currentSidebarInfo = useSidebarInfo(currentSidebar);

  const onFormClose = useCallback(() => {
    dispatch(popReactionPathComponents());
  }, [dispatch]);

  const onSidebarClose = useCallback(() => {
    dispatch(clearReactionPathComponentsList());
  }, [dispatch]);

  return (
    <Drawer
      position="right"
      classNames={{ header: classes.header, content: classes.sidebar, body: classes.body }}
      title={currentSidebarInfo?.sidebarTitle}
      opened={reactionPathComponentsList.length > 0}
      onClose={onSidebarClose}
    >
      {reactionPathComponentsList.map((sidebarForm, index) => (
        <SidebarForm
          key={index}
          reactionId={reactionId}
          reactionPathComponents={sidebarForm}
          isHidden={index === reactionPathComponentsList.length}
          onFormClose={onFormClose}
        />
      ))}
    </Drawer>
  );
}

export const ReactionDetailsSidebar = memo(ReactionDetailsSidebarComponent);
