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
import { Button, Flex, Modal, Text } from '@mantine/core';
import { useCallback } from 'react';
import type { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import { pasteReactionPart } from './reactionEntityForm.utils.ts';

interface ReactionEntityPasteProps {
  name: string;
  entityField: ReactionNodeEntity;
  onClose: () => void;
  onSave: (reactionPart: object) => void;
}

export function ReactionEntityPaste({ onClose, name, entityField, onSave }: Readonly<ReactionEntityPasteProps>) {
  const onPaste = useCallback(async () => {
    const [result] = await pasteReactionPart(entityField);
    if (result) {
      onSave(result);
      onClose();
    }
  }, [entityField, onClose, onSave]);

  return (
    <Modal
      opened
      title="Are you sure?"
      onClose={onClose}
    >
      <Flex
        direction="column"
        gap="md"
      >
        <Text>Your current {name} will be replaced with the value from your clipboard</Text>
        <Flex
          justify="flex-end"
          align="center"
          gap="sm"
        >
          <Button
            variant="default"
            onClick={onClose}
          >
            Close
          </Button>
          <Button onClick={onPaste}>Paste</Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
