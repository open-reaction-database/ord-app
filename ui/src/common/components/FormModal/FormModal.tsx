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
import type { ReactNode } from 'react';
import { Button, Flex, Modal } from '@mantine/core';

interface FormModalProps {
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  submitTitle?: string;
  loading?: boolean;
}

export function FormModal({ onClose, onSubmit, title, children, submitTitle, loading }: Readonly<FormModalProps>) {
  return (
    <Modal
      opened
      onClose={onClose}
      centered
      title={title}
    >
      <form onSubmit={onSubmit}>
        <Flex
          direction="column"
          gap="sm"
        >
          {children}
          <Flex
            justify="flex-end"
            align="center"
            gap="md"
          >
            <Button
              variant="default"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {submitTitle ?? 'Create'}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
}
