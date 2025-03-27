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
import type { ReactionValueLabelProps } from './reactionValueLabel.types.ts';
import { useCallback, useContext, useMemo, useState } from 'react';
import { reactionEntityContext } from '../../ReactionEntities/reactionEntity.context.ts';
import { ActionIcon, Button, Flex, Text } from '@mantine/core';
import { CloseIcon, EditIcon } from 'common/icons';
import classes from './reactionValueLabel.module.scss';
import { useSelector } from 'react-redux';
import { selectTemplateVariableWrapper } from 'store/entities/reactions/reactions.selectors.ts';
import type { ReactionFormStandaloneField } from '../../ReactionEntities';
import clsx from 'clsx';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addUpdateVariable, removeVariable } from 'store/entities/templates/templates.thunks.ts';
import { TemplateVariableEdit } from './TemplateVariableEdit.tsx';
import type { Variable } from 'store/entities/templates/templates.types.ts';

type ReactionValueLabelPropsMandatoryLabel = Omit<ReactionValueLabelProps, 'wrapperConfig'> & {
  wrapperConfig: Omit<ReactionFormStandaloneField, 'label'> & { label: string };
};

const labelToVariableName = (label: string) => {
  return label
    .split(/\s/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

function TemplateReactionValueLabel({ wrapperConfig, name, type }: Readonly<ReactionValueLabelPropsMandatoryLabel>) {
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const templateId = reactionId as string;
  const dispatch = useAppDispatch();
  const { label } = wrapperConfig;
  const [variableNameValue, setVariableNameValue] = useState<string | null>(null);

  const fieldPathComponents = useMemo(() => {
    const nameParts = name.split('.');
    return pathComponents.concat(nameParts);
  }, [pathComponents, name]);

  const onEditClose = useCallback(() => {
    setVariableNameValue(null);
  }, [setVariableNameValue]);

  const onEditSave = (variableName: string) => {
    const variable: Variable = {
      name: variableName as string,
      field: name,
      path: fieldPathComponents,
      type: type,
    };
    dispatch(addUpdateVariable({ templateId, variable }));
    setVariableNameValue(null);
  };

  const variablePath = useMemo(() => {
    return fieldPathComponents.join('.');
  }, [fieldPathComponents]);

  const variable = useSelector(selectTemplateVariableWrapper(templateId, variablePath));
  const hasVariable = !!variable;

  const onVariableRemove = useCallback(() => {
    dispatch(removeVariable({ templateId, variable: variable }));
  }, [dispatch, templateId, variable]);

  const onEditOpen = useCallback(() => {
    const name = variable?.name ?? labelToVariableName(label);
    setVariableNameValue(name);
  }, [variable, label, setVariableNameValue]);

  const rootClassName = clsx(classes.badge, { [classes.filled]: hasVariable });

  return variableNameValue !== null ? (
    <TemplateVariableEdit
      templateId={templateId}
      initialValue={variableNameValue}
      onClose={onEditClose}
      onSubmit={onEditSave}
      path={fieldPathComponents}
    />
  ) : (
    <Flex
      className={classes.badgeWrapper}
      align="flex-end"
    >
      <Button
        classNames={{ root: rootClassName, label: classes.label }}
        onClick={onEditOpen}
        size="xs"
      >
        <Text className={classes.text}>{variable ? `@${variable.name}` : label}</Text>
        <EditIcon className={classes.icon} />
      </Button>
      {hasVariable && (
        <ActionIcon
          size="xs"
          classNames={{ root: rootClassName }}
          onClick={onVariableRemove}
        >
          <CloseIcon className={classes.icon} />
        </ActionIcon>
      )}
    </Flex>
  );
}

export function TemplateReactionValueLabelWrapper({ wrapperConfig, type, name }: Readonly<ReactionValueLabelProps>) {
  if (!wrapperConfig?.label) {
    return null;
  }
  return (
    <TemplateReactionValueLabel
      wrapperConfig={wrapperConfig}
      name={name}
      type={type}
    />
  );
}
