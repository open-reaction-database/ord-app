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
import { Anchor, Breadcrumbs, Drawer, Flex } from '@mantine/core';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ReactionEntityForm } from '../ReactionEntities/ReactionEntityForm/ReactionEntityForm.tsx';
import { useSelector } from 'react-redux';
import { selectReactionPathComponentsList } from 'store/features/reactionForm/reactionForm.selectors.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import {
  clearReactionPathComponentsList,
  popReactionPathComponents,
  sliceReactionPathComponentsList,
} from 'store/features/reactionForm/reactionForm.actions.ts';
import { getSidebarInfo } from 'features/reactions/ReactionEntities/sidebarInfo/getSidebarInfo.tsx';
import { nodeToComponentContext } from 'features/reactions/ReactionEntities/reactionEntityNode/reactionEntityNode.context.ts';
import { reactionNodeToComponent } from 'features/reactions/ReactionEntities';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmationModal } from 'common/components/ConfirmationModal/ConfirmationModal.tsx';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface EditSidebarProps {
  reactionId: ReactionId;
}

function ReactionDetailsSidebarComponent({ reactionId }: Readonly<EditSidebarProps>) {
  const dispatch = useAppDispatch();
  const reactionPathComponentsList = useSelector(selectReactionPathComponentsList);
  const [isOpenedCloseAll, { open: openCloseAllConfirmation, close: closeCloseAllConfirmation }] = useDisclosure();
  const [isOpenedClose, { open: openCloseConfirmation, close: closeCloseConfirmation }] = useDisclosure();

  const currentIndex = reactionPathComponentsList.length - 1;

  const [areSidebarFormsDirty, setAreSidebarFormsDirty] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const reactionPaths = reactionPathComponentsList.map(item => item.join(''));
    setAreSidebarFormsDirty(areSidebarFormsDirty =>
      reactionPaths.reduce(
        (acc, key) => ({
          ...acc,
          [key]: areSidebarFormsDirty[key] ?? false,
        }),
        {},
      ),
    );
  }, [reactionPathComponentsList, setAreSidebarFormsDirty]);

  const sidebarInfos = useMemo(() => {
    return reactionPathComponentsList.map(item => getSidebarInfo([...item].reverse()));
  }, [reactionPathComponentsList]);

  const isOpened = reactionPathComponentsList.length > 0;

  const onFormClose = useCallback(() => {
    dispatch(popReactionPathComponents());
    closeCloseConfirmation();
  }, [dispatch, closeCloseConfirmation]);

  const onSidebarClose = useCallback(() => {
    dispatch(clearReactionPathComponentsList());
    closeCloseAllConfirmation();
  }, [dispatch, closeCloseAllConfirmation]);

  useEffect(() => {
    return () => {
      onSidebarClose();
    };
  }, [onSidebarClose]);

  const breadcrumbs = useMemo(() => {
    const length = reactionPathComponentsList.length;
    return reactionPathComponentsList.map((_, index) => {
      const isLast = index === length - 1;
      if (isLast) {
        return {
          name: '',
          onClick: () => {},
        };
      }
      return {
        name: sidebarInfos[index].label,
        onClick: () => {
          dispatch(sliceReactionPathComponentsList(index));
        },
      };
    });
  }, [dispatch, reactionPathComponentsList, sidebarInfos]);

  const currentPath = reactionPathComponentsList[currentIndex];
  const currentSidebarInfo = sidebarInfos[currentIndex];

  const SidebarTitle = useMemo(() => {
    return currentSidebarInfo?.sidebarTitle ?? null;
  }, [currentSidebarInfo]);

  const onActualFormClose = useMemo(() => {
    return areSidebarFormsDirty[currentPath?.join('')] ? openCloseConfirmation : onFormClose;
  }, [areSidebarFormsDirty, currentPath, onFormClose, openCloseConfirmation]);

  const onActualSidebarClose = useMemo(() => {
    return Object.values(areSidebarFormsDirty).some(item => item) ? openCloseAllConfirmation : onSidebarClose;
  }, [areSidebarFormsDirty, onSidebarClose, openCloseAllConfirmation]);

  const onSetFormDirty = useCallback(
    (pathComponents: ReactionPathComponents, value: boolean) => {
      setAreSidebarFormsDirty(prevState => ({
        ...prevState,
        [pathComponents.join('')]: value,
      }));
    },
    [setAreSidebarFormsDirty],
  );

  return (
    <>
      <Drawer.Root
        opened={isOpened}
        onClose={onActualSidebarClose}
        position="right"
        classNames={{ header: classes.header, content: classes.sidebar, body: classes.body }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Flex direction="column">
              <Breadcrumbs>
                {breadcrumbs.map((item, index) => (
                  <Anchor
                    onClick={item.onClick}
                    key={index}
                  >
                    {item.name}
                  </Anchor>
                ))}
              </Breadcrumbs>
              {SidebarTitle && (
                <SidebarTitle
                  reactionId={reactionId}
                  pathComponents={reactionPathComponentsList[currentIndex]}
                />
              )}
            </Flex>
            <Drawer.CloseButton />
          </Drawer.Header>
          <nodeToComponentContext.Provider value={reactionNodeToComponent}>
            {reactionPathComponentsList.map((sidebarForm, index) => (
              <ReactionEntityForm
                key={index}
                reactionPathComponents={sidebarForm}
                sidebarInfo={sidebarInfos[index]}
                isHidden={index !== reactionPathComponentsList.length - 1}
                onFormClose={onActualFormClose}
                onSetFormDirty={onSetFormDirty}
              />
            ))}
          </nodeToComponentContext.Provider>
        </Drawer.Content>
      </Drawer.Root>
      <ConfirmationModal
        title="Close form"
        text="Are you sure you want to close this form? You will lose all unsaved changes."
        onClose={closeCloseConfirmation}
        onConfirm={onFormClose}
        opened={isOpenedClose}
      />
      <ConfirmationModal
        title="Close sidebar"
        text="Are you sure you want to close the sidebar? You will lose all unsaved changes from all forms."
        onClose={closeCloseAllConfirmation}
        onConfirm={onSidebarClose}
        opened={isOpenedCloseAll}
      />
    </>
  );
}

export const ReactionDetailsSidebar = memo(ReactionDetailsSidebarComponent);
