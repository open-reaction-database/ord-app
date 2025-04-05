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
import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Flex, Modal, Progress, Text } from '@mantine/core';
import classes from './enumerationProgress.module.scss';
import type { EnumerationProgress } from 'store/entities/enumeration/enumeration.types.ts';

interface EnumerationProgressDisplayProps {
  enumerationProgress: EnumerationProgress;
  onClose: () => void;
}

export function EnumerationProgressDisplay({
  enumerationProgress,
  onClose,
}: Readonly<EnumerationProgressDisplayProps>) {
  const [closeConfirmationOpened, setCloseConfirmationOpened] = useState(false);
  const handleClose = useCallback(() => {
    setCloseConfirmationOpened(true);
  }, [setCloseConfirmationOpened]);

  const onCloseCancel = useCallback(() => {
    setCloseConfirmationOpened(false);
  }, [setCloseConfirmationOpened]);

  const progress = useMemo(() => {
    const enumerationPercent = (enumerationProgress.index / enumerationProgress.templateCSV.content.length) * 100;
    return enumerationPercent * 0.85;
  }, [enumerationProgress]);

  const isUploading = progress >= 85;

  return (
    <Modal
      opened
      onClose={handleClose}
      title="Please wait"
    >
      {closeConfirmationOpened ? (
        <Flex
          direction="column"
          gap="sm"
        >
          <Alert
            color="orange"
            title="Are you sure?"
          >
            Are you sure you want to interrupt the enumeration progress
          </Alert>
          <Flex
            align="center"
            gap="sm"
            justify="flex-end"
          >
            <Button
              variant="default"
              onClick={onCloseCancel}
            >
              Cancel
            </Button>
            <Button onClick={onClose}>Confirm</Button>
          </Flex>
        </Flex>
      ) : (
        <Flex
          direction="column"
          gap="sm"
        >
          <Flex
            align="center"
            justify="space-between"
          >
            <Text className={classes.text}>{isUploading ? 'Uploading...' : 'Enumerating...'}</Text>
            <Text className={classes.text}>{progress.toFixed(0)}%</Text>
          </Flex>
          <Progress
            value={progress}
            size="lg"
            radius="md"
          />
          <Alert title="Please note">
            Dataset enumeration progress will interrupt if you close this modal of browser tab. Large datasets
            enumeration may take a few minutes
          </Alert>
        </Flex>
      )}
    </Modal>
  );
}
