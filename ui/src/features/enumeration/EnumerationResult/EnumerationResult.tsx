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
import { Button, Flex, Modal, ScrollArea, Title } from '@mantine/core';
import type { EnumerationProgress } from 'store/entities/enumeration/enumeration.types.ts';
import { useCallback } from 'react';
import { useLocation } from 'wouter';

interface EnumerationResultProps {
  enumerationProgress: Required<EnumerationProgress>;
  onClose: () => void;
}

export function EnumerationResult({ enumerationProgress, onClose }: Readonly<EnumerationResultProps>) {
  const { resultDatasetId, reactions, errors } = enumerationProgress;
  const [, navigate] = useLocation();
  const onNavigate = useCallback(() => {
    onClose();
    navigate(`~/datasets/${resultDatasetId}`);
  }, [navigate, onClose, resultDatasetId]);

  return (
    <Modal
      opened
      onClose={onClose}
      title="Enumeration Result"
    >
      <Flex direction="column">
        <Title order={3}>Reactions created: {reactions.length}</Title>
        {errors.length > 0 && (
          <>
            <Title order={3}>Failed to create lines:</Title>
            <ScrollArea
              h={200}
              scrollbars="y"
            >
              {errors.map(error => error)}
            </ScrollArea>
          </>
        )}
        <Flex
          align="center"
          justify="flex-end"
          gap="sm"
        >
          <Button
            variant="default"
            onClick={onClose}
          >
            Close
          </Button>
          <Button onClick={onNavigate}>Go to dataset</Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
