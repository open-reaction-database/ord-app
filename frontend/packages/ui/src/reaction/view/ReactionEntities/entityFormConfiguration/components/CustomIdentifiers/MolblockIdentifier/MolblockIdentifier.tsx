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
import { Flex } from '@mantine/core';
import classes from './molblockIdentifier.module.scss';
import { DisplayMolblockPreview } from './DisplayMolblockPreview.tsx';
import { KeyValueDisplay } from '#display/KeyValueDisplay/KeyValueDisplay.tsx';
import { useContext } from 'react';
import { reactionEntityContext } from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import {
  useIsViewOnly,
  useReactionSlots,
} from '#reaction/provider/reactionProvider.hooks.ts';
import { ReactionEntityDelete } from '#reaction/view/ReactionEntities/ReactionEntityDelete/ReactionEntityDelete.tsx';
import type { ReactionCompoundIdentifier } from '#reaction/model/reactionEntity/reactionEntity.types.ts';

interface MolblockIdentifierProps {
  index: number;
  itemKey: number;
  identifier: ReactionCompoundIdentifier;
  onEdit: (index: number) => void;
}

export function MolblockIdentifier({
  identifier,
  itemKey,
  index,
  onEdit,
}: Readonly<MolblockIdentifierProps>) {
  const { ViewDeleteButtons, MoleculeEditor } = useReactionSlots();
  const isViewOnly = useIsViewOnly();
  const { pathComponents } = useContext(reactionEntityContext);
  const identifierPath = [...pathComponents, 'molBlockIdentifiers', itemKey];
  return (
    <Flex
      key={identifier.value}
      direction="column"
      gap="sm"
    >
      <Flex
        align="flex-start"
        gap="md"
        className={classes.molblock}
      >
        <DisplayMolblockPreview identifier={identifier} />
        <Flex
          direction="column"
          gap="xs"
        >
          <KeyValueDisplay
            label="Type"
            value={identifier.type}
            multiline
          />
          <KeyValueDisplay
            label="Details"
            value={identifier.details}
            multiline
          />
        </Flex>
        <Flex>
          {/* Without a molecule editor, an editable molblock can be removed but not redrawn. */}
          {MoleculeEditor || isViewOnly ? (
            <ViewDeleteButtons
              entityName="Identifier"
              pathComponents={identifierPath}
              onEdit={() => onEdit(index)}
            />
          ) : (
            <ReactionEntityDelete
              entityName="Identifier"
              pathComponents={identifierPath}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
