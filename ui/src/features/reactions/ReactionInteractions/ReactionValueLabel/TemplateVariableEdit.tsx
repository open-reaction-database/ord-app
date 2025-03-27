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
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { useField } from '@mantine/form';
import { Button, Flex, TextInput } from '@mantine/core';
import { selectTemplateVariablesWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { useTemplateVariableEditSchema } from './templateVariableEdit.schema.ts';
import { ValidationError } from 'yup';
import classes from './reactionValueLabel.module.scss';

interface TemplateVariableEditProps {
  templateId: string;
  initialValue: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  path: ReactionPathComponents;
}

export function TemplateVariableEdit({
  templateId,
  initialValue,
  path,
  onSubmit,
  onClose,
}: Readonly<TemplateVariableEditProps>) {
  const existingVariables = useSelector(selectTemplateVariablesWrapper(templateId));
  const restrictedNames = useMemo(() => {
    const variablePath = path.join('.');
    const { [variablePath]: _, ...variablesWithoutCurrent } = existingVariables;
    return Object.values(variablesWithoutCurrent).map(variable => variable.name);
  }, [existingVariables, path]);
  const schema = useTemplateVariableEditSchema(restrictedNames);

  const field = useField<string>({
    initialValue,
    validateOnChange: true,
    validate: value => {
      try {
        schema.validateSync(value);
        return null;
      } catch (e: ValidationError | unknown) {
        if (e instanceof ValidationError) {
          return e.message;
        }
        return null;
      }
    },
  });

  const handleSubmit = async () => {
    await field.validate();
    if (field.error) {
      return;
    }
    onSubmit(field.getValue());
  };

  return (
    <Flex
      gap="sm"
      align="flex-end"
    >
      <TextInput
        variant="unstyled"
        placeholder="Variable name"
        {...field.getInputProps()}
        classNames={{ input: classes.input }}
      />
      <Button
        size="xs"
        onClick={onClose}
        variant="default"
        className={classes.inputButton}
      >
        Close
      </Button>
      <Button
        size="xs"
        onClick={handleSubmit}
        className={classes.inputButton}
      >
        Save
      </Button>
    </Flex>
  );
}
