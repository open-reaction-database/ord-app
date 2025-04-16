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
import { Divider, Grid, Title } from '@mantine/core';
import { PaperButton } from 'common/components/interactions/PaperButton/PaperButton.tsx';
import { SearchIcon, StylusNoteIcon } from 'common/icons';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { useCallback, useContext, useState } from 'react';
import { ord } from 'ord-schema-protobufjs';
import { ComponentsKetcherEditor } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsKetcherEditor/ComponentsKetcherEditor.tsx';
import { useDisclosure } from '@mantine/hooks';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { MolblockIdentifier } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/MolblockIdentifier/MolblockIdentifier.tsx';
import { setReactionLookupOpenedAction } from 'store/features/reactionLookup/reactionLookup.actions.ts';
import { useSelector } from 'react-redux';
import { selectIsReactionLookupOpen } from 'store/features/reactionLookup/reactionLookup.selectors.ts';
import { ComponentsLookup } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsLookup/ComponentsLookup.tsx';
import { colorToCssVariable } from 'common/styling/colors.ts';
import { ordCompoundIdentifierToReaction } from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

type IdentifierData = Pick<ReactionCompoundIdentifier, 'value' | 'details'>;

const ENTITY_FIELD = 'molBlockIdentifiers';

const useSelectIdentifiers = buildUseSelectItems(ENTITY_FIELD);

const useCreateNewMolblockIdentifier = buildUseCreate(
  ENTITY_FIELD,
  (newIndex, _, value?: unknown) => {
    const newIdentifier = ordCompoundIdentifierToReaction(
      ord.CompoundIdentifier.toObject(
        new ord.CompoundIdentifier({
          type: ord.CompoundIdentifier.CompoundIdentifierType.MOLBLOCK,
          ...((value as IdentifierData) || {}),
        }),
      ),
    );
    return [newIndex, newIdentifier];
  },
  false,
);

export function CustomIdentifiers() {
  const dispatch = useAppDispatch();
  const { reactionId, isViewOnly } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);
  const [componentsEditorOpened, { open: openComponentsEditor, close: closeComponentsEditor }] = useDisclosure();
  const [editedMolblock, setEditedMolblock] = useState<number | null>(null);
  const createNewMolblockIdentifier = useCreateNewMolblockIdentifier();
  const isReactionLookupOpened = useSelector(selectIsReactionLookupOpen);

  const openAddCustomIdentifier = useCallback(() => {
    dispatch(setReactionLookupOpenedAction(true));
  }, [dispatch]);

  const closeAddCustomIdentifier = useCallback(() => {
    dispatch(setReactionLookupOpenedAction(false));
  }, [dispatch]);

  const identifiers: Array<ReactionCompoundIdentifier> = useSelectIdentifiers();

  const handleCloseKetcher = useCallback(() => {
    setEditedMolblock(null);
    closeComponentsEditor();
  }, [closeComponentsEditor]);

  const onEditMolblock = (molblockIndex: number) => {
    setEditedMolblock(molblockIndex);
    openComponentsEditor();
  };

  const onSaveMolblock = (value: IdentifierData) => {
    if (editedMolblock !== null) {
      const identifier = {
        ...identifiers[editedMolblock],
        ...value,
      };
      const newPathComponents = [...pathComponents, ENTITY_FIELD, editedMolblock];
      dispatch(addUpdateReactionField({ reactionId, pathComponents: newPathComponents, newValue: identifier }));
    } else {
      createNewMolblockIdentifier(identifiers.length, identifiers, value);
    }
  };

  const selectedMolblockIdentifier = editedMolblock !== null ? identifiers[editedMolblock] : null;

  return (
    <>
      <Divider
        label="At least one identifier is required"
        labelPosition="left"
      />
      {!isViewOnly && (
        <Grid>
          <Grid.Col span={6}>
            <PaperButton
              title="Add Identifier"
              description="Via Look up Name"
              icon={<SearchIcon />}
              color={colorToCssVariable['orange']}
              onClick={openAddCustomIdentifier}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <PaperButton
              title="Add Molblock Identifier"
              description="Via Ketcher"
              icon={<StylusNoteIcon />}
              color={colorToCssVariable['green']}
              onClick={openComponentsEditor}
            />
          </Grid.Col>
        </Grid>
      )}
      <ReactionEntityBlock
        renderedTitle={<ReactionEntityBlockTitle leftSection={<Title order={3}>Molblock Identifiers</Title>} />}
      >
        {identifiers.map((identifier, index) => (
          <MolblockIdentifier
            key={identifier.id}
            identifier={identifier}
            itemKey={index}
            index={index}
            onEdit={onEditMolblock}
          />
        ))}
      </ReactionEntityBlock>

      <ComponentsKetcherEditor
        opened={componentsEditorOpened}
        onSave={onSaveMolblock}
        onClose={handleCloseKetcher}
        identifier={selectedMolblockIdentifier}
      />

      {isReactionLookupOpened && <ComponentsLookup onClose={closeAddCustomIdentifier} />}
    </>
  );
}
