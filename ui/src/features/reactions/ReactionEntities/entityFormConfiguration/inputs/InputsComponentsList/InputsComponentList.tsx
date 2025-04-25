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
import { Button } from '@mantine/core';
import { ord } from 'ord-schema-protobufjs';
import { AddCircleIcon } from 'common/icons';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useCallback, useContext } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addReactionPathComponentToList } from 'store/features/reactionForm/reactionForm.actions.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { ComponentsList } from 'features/reactions/ReactionView/ComponentsList/ComponentsList.tsx';
import { ordInputComponentToReaction } from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import { TitleDelimiterAmount } from 'common/components/display/TitleDelimiterAmount/TitleDelimiterAmount.tsx';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import { ComponentsListOrEmpty } from 'common/components/display/ComponentsListOrEmpty/ComponentsListOrEmpty.tsx';
import { renderValuePrecisionUnit } from 'features/reactions/ReactionView/renderValuePrecisionUnit';

const useSelectData = buildUseSelectItems('components');

const renderDetails = ({ amount }: ReactionInputComponent) => (amount ? renderValuePrecisionUnit(amount) : '');

export function InputsComponentList() {
  const dispatch = useAppDispatch();
  const { reactionId, isViewOnly } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);
  const components = useSelectData() as Array<ReactionInputComponent>;
  const length = components.length;

  const onCreateComponent = useCallback(() => {
    const newComponent = ordInputComponentToReaction(ord.Compound.toObject(new ord.Compound()));
    const newPath = [...pathComponents, 'components', length];
    dispatch(addUpdateReactionField({ reactionId, pathComponents: newPath, newValue: newComponent }));
    dispatch(addReactionPathComponentToList(newPath));
  }, [dispatch, reactionId, pathComponents, length]);

  return (
    <ReactionEntityBlock
      renderedTitle={
        <ReactionEntityBlockTitle
          leftSection={
            <TitleDelimiterAmount
              title="Components"
              amount={components.length}
            />
          }
          rightSection={
            !isViewOnly && (
              <Button
                variant="transparent"
                leftSection={<AddCircleIcon />}
                onClick={onCreateComponent}
              >
                Add component
              </Button>
            )
          }
        />
      }
    >
      <ComponentsListOrEmpty componentsAmount={components.length}>
        <ComponentsList
          components={components}
          rootPathComponents={pathComponents}
          onlyOpenOneSidebar={true}
          detailsHeader="Amount"
          entityName="components"
          renderDetails={renderDetails}
        />
      </ComponentsListOrEmpty>
    </ReactionEntityBlock>
  );
}
