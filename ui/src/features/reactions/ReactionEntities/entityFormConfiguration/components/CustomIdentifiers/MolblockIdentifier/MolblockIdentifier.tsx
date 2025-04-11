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
import { KeyValueDisplay } from 'common/components/display/KeyValueDisplay/KeyValueDisplay.tsx';
import { useContext } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { reactionContext } from 'features/reactions/reactions.context.ts';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';

interface MolblockIdentifierProps {
  index: number;
  itemKey: number;
  identifier: ReactionCompoundIdentifier;
  onEdit: (index: number) => void;
}

export function MolblockIdentifier({ identifier, itemKey, index, onEdit }: Readonly<MolblockIdentifierProps>) {
  const { ViewDeleteButtonsComponent } = useContext(reactionContext);
  const { pathComponents } = useContext(reactionEntityContext);
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
            value="Molblock"
            multiline
          />
          <KeyValueDisplay
            label="Details"
            value={identifier.details}
            multiline
          />
        </Flex>
        <Flex>
          <ViewDeleteButtonsComponent
            entityName="Identifier"
            pathComponents={[...pathComponents, 'molBlockIdentifiers', itemKey]}
            onEdit={() => onEdit(index)}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
