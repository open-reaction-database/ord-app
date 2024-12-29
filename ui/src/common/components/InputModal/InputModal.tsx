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
import { Button, Flex, Input, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import classes from './InputModal.module.scss';
import { useEffect } from 'react';

interface InputModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
  title: string;
  initialValue?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
}

interface InputModalForm {
  value: string;
}

export function InputModal({
  opened,
  onClose,
  onSubmit,
  title,
  inputLabel,
  initialValue = '',
  inputPlaceholder = '',
}: Readonly<InputModalProps>) {
  const {
    onSubmit: onFormSubmit,
    reset,
    getInputProps,
    setValues,
    errors,
  } = useForm<InputModalForm>({
    initialValues: {
      value: initialValue,
    },
    validate: {
      value: (value: string) => (!value.trim() ? `${inputLabel} is required` : null),
    },
  });

  useEffect(() => {
    setValues({ value: initialValue });
  }, [setValues, initialValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: InputModalForm) => {
    await onSubmit(values.value);
    reset();
    handleClose();
  };

  return (
    <Modal
      classNames={{ content: classes.modal, header: classes.header, body: classes.body }}
      opened={opened}
      onClose={handleClose}
      title={title}
      centered
    >
      <form onSubmit={onFormSubmit(handleFormSubmit)}>
        <Input.Wrapper
          classNames={{ root: classes.inputWrapper, error: classes.inputError, label: classes.inputLabel }}
          label={inputLabel}
        >
          <Input
            {...getInputProps('value')}
            placeholder={inputPlaceholder || `Enter ${inputLabel?.toLowerCase()}`}
          />

          <Input.Error>{errors.value}</Input.Error>
        </Input.Wrapper>

        <Flex
          justify="flex-end"
          gap="16"
        >
          <Button
            className={`${classes.button} ${classes.closeButton}`}
            variant="default"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            className={classes.button}
            type="submit"
          >
            Save
          </Button>
        </Flex>
      </form>
    </Modal>
  );
}
