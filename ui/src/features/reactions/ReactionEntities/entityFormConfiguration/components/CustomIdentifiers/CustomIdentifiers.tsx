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
import { PaperButton } from 'common/components/PaperButton/PaperButton.tsx';
import { SearchIcon, StylusNoteIcon } from 'common/icons';
import { buildUseSelectItems } from 'features/reactions/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { useCallback, useContext, useMemo, useState } from 'react';
import { ord } from 'ord-schema-protobufjs';
import { ComponentsKetcherEditor } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsKetcherEditor/ComponentsKetcherEditor.tsx';
import { useDisclosure } from '@mantine/hooks';
import { buildUseCreate } from 'features/reactions/ReactionEntities/entityFormConfiguration/inputs/buildUseCreate.ts';
import CompoundIdentifierType = ord.CompoundIdentifier.CompoundIdentifierType;
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from 'features/reactions/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';
import { MolblockIdentifier } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/MolblockIdentifier/MolblockIdentifier.tsx';
import { setReactionLookupOpenedAction } from 'store/features/reactionLookup/reactionLookup.actions.ts';
import { useSelector } from 'react-redux';
import { selectIsReactionLookupOpen } from 'store/features/reactionLookup/reactionLookup.selectors.ts';
import { ComponentsLookup } from 'features/reactions/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsLookup/ComponentsLookup.tsx';
import { colorToCssVariable } from 'common/styling/colors.ts';

const useSelectIdentifiers = buildUseSelectItems('identifiers');

type IdentifierData = Pick<ord.CompoundIdentifier, 'value' | 'details'>;

const useCreateNewMolblockIdentifier = buildUseCreate(
  'identifiers',
  (newIndex, _, value?: unknown) => {
    const newIdentifier = ord.CompoundIdentifier.toObject(
      new ord.CompoundIdentifier({
        type: CompoundIdentifierType.MOLBLOCK,
        ...((value as IdentifierData) || {}),
      }),
    );
    return [newIndex, newIdentifier];
  },
  false,
);

export function CustomIdentifiers() {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
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

  const identifiers: Array<ord.CompoundIdentifier> = useSelectIdentifiers();
  const molblockIdentifiers = useMemo(() => {
    return (identifiers || []).reduce(
      (acc: Array<[number, ord.CompoundIdentifier]>, item, index) =>
        item.type === CompoundIdentifierType.MOLBLOCK ? acc.concat([[index, item]]) : acc,
      [],
    );
  }, [identifiers]);

  const handleCloseKetcher = useCallback(() => {
    setEditedMolblock(null);
    closeComponentsEditor();
  }, [closeComponentsEditor]);

  const onEditMolblock = (molblockIndex: number) => {
    setEditedMolblock(molblockIndex);
    openComponentsEditor();
  };

  const onSaveMolblock = (value: Pick<ord.CompoundIdentifier, 'details' | 'value'>) => {
    if (editedMolblock !== null) {
      const identifierIndex = molblockIdentifiers[editedMolblock][0];
      const identifier = {
        ...molblockIdentifiers[editedMolblock][1],
        ...value,
      };
      const newPathComponents = [...pathComponents, 'identifiers', identifierIndex];
      dispatch(addUpdateReactionField({ reactionId, pathComponents: newPathComponents, newValue: identifier }));
    } else {
      createNewMolblockIdentifier(identifiers.length, identifiers, value);
    }
  };

  const selectedMolblockIdentifier = editedMolblock !== null ? molblockIdentifiers[editedMolblock][1] : null;

  return (
    <>
      <Divider
        label="At least one identifier is required"
        labelPosition="left"
      />
      <Grid>
        <Grid.Col span={6}>
          <PaperButton
            title="Look up Name"
            description="In open databases"
            icon={<SearchIcon />}
            color={colorToCssVariable['orange']}
            onClick={openAddCustomIdentifier}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <PaperButton
            title="Draw Component"
            description="Via Ketcher"
            icon={<StylusNoteIcon />}
            color={colorToCssVariable['green']}
            onClick={openComponentsEditor}
          />
        </Grid.Col>
      </Grid>
      <ReactionEntityBlock
        renderedTitle={
          <ReactionEntityBlockTitle
            leftSection={
              <>
                <Title order={3}>Molblock identifiers</Title>
                <span> · {molblockIdentifiers.length}</span>
              </>
            }
          />
        }
      >
        {molblockIdentifiers.map(([originalIndex, identifier], index) => (
          <MolblockIdentifier
            key={identifier.value}
            identifier={identifier}
            itemKey={originalIndex}
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
