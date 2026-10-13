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
import { PaperButton } from '#display/interactions/PaperButton/PaperButton.tsx';
import { SearchIcon, StylusNoteIcon } from '#theme/icons/index.ts';
import { buildUseSelectItems } from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseSelectItems.ts';
import { useCallback, useContext, useState } from 'react';
import { create } from '@bufbuild/protobuf';
import { CompoundIdentifierSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { useDisclosure } from '@mantine/hooks';
import { buildUseCreate } from '#reaction/view/ReactionEntities/entityFormConfiguration/buildUseCreate.ts';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import {
  useIsViewOnly,
  useReactionActions,
  useReactionSlots,
} from '#reaction/provider/reactionProvider.hooks.ts';
import { type MoleculeIdentifier } from '#reaction/provider/reactionProvider.types.ts';
import { MolblockIdentifier } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/MolblockIdentifier/MolblockIdentifier.tsx';
import { ComponentsLookup } from '#reaction/view/ReactionEntities/entityFormConfiguration/components/CustomIdentifiers/ComponentsLookup/ComponentsLookup.tsx';
import { colorToCssVariable } from '#theme/colors.ts';
import { ordCompoundIdentifierToReaction } from '#reaction/model/reactionEntity/reactionEntity.converters.ts';
import { type ReactionCompoundIdentifier } from '#reaction/model/reactionEntity/reactionEntity.types.ts';
import {
  DEFAULT_STRUCTURE_IDENTIFIER_TYPE,
  isStructureIdentifierType,
} from '#reaction/model/reactionEntity/structureIdentifiers.ts';
import { reactionCompoundIdentifierTypeToOrd } from '#reaction/model/reactionEntityTypes/reactionEntityTypes.converters.ts';
import {
  ReactionEntityBlock,
  ReactionEntityBlockTitle,
} from '#reaction/view/ReactionEntities/reactionEntityNode/ReactionEntityBlock/ReactionEntityBlock.tsx';

const ENTITY_FIELD = 'molBlockIdentifiers';

const useSelectIdentifiers =
  buildUseSelectItems<ReactionCompoundIdentifier>(ENTITY_FIELD);

const useCreateNewMolblockIdentifier = buildUseCreate(
  ENTITY_FIELD,
  (newIndex, _, value?: unknown) => {
    const {
      type = DEFAULT_STRUCTURE_IDENTIFIER_TYPE,
      value: identifierValue,
      details,
    } = (value as MoleculeIdentifier | undefined) ?? {};
    const newIdentifier = ordCompoundIdentifierToReaction(
      create(CompoundIdentifierSchema, {
        type: reactionCompoundIdentifierTypeToOrd(type),
        value: identifierValue ?? undefined,
        details: details ?? undefined,
      }),
    );
    return [newIndex, newIdentifier];
  },
  false,
);

export function CustomIdentifiers() {
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const { MoleculeEditor } = useReactionSlots();
  const { pathComponents } = useContext(reactionEntityContext);
  const [
    moleculeEditorOpened,
    { open: openMoleculeEditor, close: closeMoleculeEditor },
  ] = useDisclosure();
  const [editedMolblock, setEditedMolblock] = useState<number | null>(null);
  const createNewMolblockIdentifier = useCreateNewMolblockIdentifier();
  const [isLookupOpened, { open: openLookup, close: closeLookup }] = useDisclosure();

  const identifiers = useSelectIdentifiers();

  const handleCloseMoleculeEditor = useCallback(() => {
    setEditedMolblock(null);
    closeMoleculeEditor();
  }, [closeMoleculeEditor]);

  const onEditMolblock = (molblockIndex: number) => {
    setEditedMolblock(molblockIndex);
    openMoleculeEditor();
  };

  const onSaveMolblock = (value: MoleculeIdentifier) => {
    if (editedMolblock !== null) {
      const identifier = {
        ...identifiers[editedMolblock],
        ...value,
      };
      const newPathComponents = [...pathComponents, ENTITY_FIELD, editedMolblock];
      void actions?.update(newPathComponents, identifier);
    } else {
      createNewMolblockIdentifier(identifiers.length, identifiers, value);
    }
  };

  const edited = editedMolblock !== null ? identifiers[editedMolblock] : undefined;
  // The component converters route only structure types to this list.
  const selectedMolblockIdentifier: MoleculeIdentifier | null =
    edited && isStructureIdentifierType(edited.type)
      ? { type: edited.type, value: edited.value, details: edited.details }
      : null;

  return (
    <>
      <Divider
        label="At least one identifier is required"
        labelPosition="left"
      />
      {!isViewOnly && (
        <Grid>
          <Grid.Col span={MoleculeEditor ? 6 : 12}>
            <PaperButton
              title="Add Identifier"
              description="Via Look up Name"
              icon={<SearchIcon />}
              color={colorToCssVariable['orange']}
              onClick={openLookup}
            />
          </Grid.Col>
          {MoleculeEditor && (
            <Grid.Col span={6}>
              <PaperButton
                title="Add Molblock Identifier"
                description={`Via ${MoleculeEditor.name}`}
                icon={<StylusNoteIcon />}
                color={colorToCssVariable['green']}
                onClick={openMoleculeEditor}
              />
            </Grid.Col>
          )}
        </Grid>
      )}
      <ReactionEntityBlock
        renderedTitle={
          <ReactionEntityBlockTitle
            leftSection={<Title order={3}>Structure Identifiers</Title>}
          />
        }
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

      {MoleculeEditor && (
        <MoleculeEditor.Editor
          opened={moleculeEditorOpened}
          onSave={onSaveMolblock}
          onClose={handleCloseMoleculeEditor}
          identifier={selectedMolblockIdentifier}
        />
      )}

      {isLookupOpened && <ComponentsLookup onClose={closeLookup} />}
    </>
  );
}
