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
import { Button, Flex, Modal, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import classes from './InputModal.module.scss';
import { requiredTextField } from 'common/utils/requiredTextField.schema';
import { useEffect } from 'react';
import * as yup from 'yup';

interface InputModalProps {
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
  title: string;
  initialValue?: string;
  inputLabel: string;
  inputPlaceholder?: string;
}

interface InputModalForm {
  value: string;
}

export function InputModal({
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
  } = useForm<InputModalForm>({
    initialValues: {
      value: initialValue,
    },
    validate: yupResolver(
      yup.object({
        value: requiredTextField(inputLabel),
      }),
    ),
    validateInputOnChange: true,
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
      opened
      classNames={{ content: classes.modal, header: classes.header, body: classes.body }}
      onClose={handleClose}
      title={title}
      centered
    >
      <form onSubmit={onFormSubmit(handleFormSubmit)}>
        <TextInput
          className={classes.inputWrapper}
          label={inputLabel}
          placeholder={inputPlaceholder || ''}
          {...getInputProps('value')}
        />
        <Flex
          justify="flex-end"
          gap="16"
        >
          <Button
            variant="default"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Flex>
      </form>
    </Modal>
  );
}
