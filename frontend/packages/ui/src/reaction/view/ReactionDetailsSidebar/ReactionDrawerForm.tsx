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
import { ReactionEntityForm } from '#reaction/view/ReactionEntities/ReactionEntityForm/ReactionEntityForm.tsx';
import { reactionNodeToComponent } from '#reaction/view/ReactionEntities/index.ts';
import { nodeToComponentContext } from '#reaction/view/ReactionEntities/reactionEntityNode/reactionEntityNode.context.ts';
import { getSidebarInfo } from '#reaction/view/ReactionEntities/sidebarInfo/getSidebarInfo.tsx';
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import { useReactionPart } from '#reaction/provider/reactionProvider.hooks.ts';

interface ReactionDrawerFormProps {
  pathComponents: ReactionPathComponents;
  /** Shows the entity's title, with its Delete icon, above the form. */
  showTitle?: boolean;
  /**
   * Closes the form, including when its title removes the entity; without it, the form
   * offers no Close or Save and Close.
   */
  onClose?: () => void;
}

const ignore = () => undefined;

/**
 * One entity's drawer form, rendered in place rather than in the drawer. It renders nothing
 * once the entity is gone, so a host can leave it mounted across a removal.
 */
export function ReactionDrawerForm({
  pathComponents,
  showTitle = false,
  onClose,
}: Readonly<ReactionDrawerFormProps>) {
  const entity = useReactionPart(pathComponents);
  if (entity === null) {
    return null;
  }
  const sidebarInfo = getSidebarInfo([...pathComponents].reverse());
  const Title = sidebarInfo.sidebarTitle;
  return (
    <nodeToComponentContext.Provider value={reactionNodeToComponent}>
      {showTitle && Title && (
        <Title
          pathComponents={pathComponents}
          onFormClose={onClose}
        />
      )}
      <ReactionEntityForm
        key={pathComponents.join('.')}
        reactionPathComponents={pathComponents}
        sidebarInfo={sidebarInfo}
        isHidden={false}
        onFormClose={onClose}
        onSetFormDirty={ignore}
      />
    </nodeToComponentContext.Provider>
  );
}
