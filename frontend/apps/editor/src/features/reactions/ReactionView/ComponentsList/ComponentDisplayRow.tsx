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
import { useContext } from 'react';
import type { ReactionComponentBase } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { ComponentDisplayRowCustomActions } from './ComponentDisplayRowCustomActions.tsx';
import type { ComponentDisplayRowProps } from './componentsList.types.ts';
import { reactionContext } from '../../reactions.context.ts';

export function ComponentDisplayRow<T extends ReactionComponentBase>({
  component,
  componentPath,
  renderDetails,
  gridClassName,
  historyPathComponents,
}: Readonly<ComponentDisplayRowProps<T>>) {
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);

  return (
    <ComponentDisplayRowCustomActions
      component={component}
      renderDetails={renderDetails}
      gridClassName={gridClassName}
      actions={
        <ViewDeleteButtonsComponent
          entityName="Component"
          pathComponents={componentPath}
          historyPathComponents={historyPathComponents}
        />
      }
    />
  );
}
