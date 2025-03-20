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
import { Form, useForm } from '@mantine/form';
import { Button, Flex } from '@mantine/core';
import classes from './reactionEntityForm.module.scss';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';
import { ReactionEntityBaseNode, reactionEntityToForm } from 'features/reactions/ReactionEntities';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { useCallback, useEffect, useMemo } from 'react';
import type { ReactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import type { ReactionSidebarInfo } from 'features/reactions/ReactionEntities/sidebarInfo/sidebarInfo.types.ts';
import { getReactionEntityTransform } from 'features/reactions/ReactionEntities/entityFormConfiguration/reactionEntityToTransform.ts';
import type { ReactionId } from 'store/entities/reactions/reactions.types.ts';

interface ReactionEntityFormProps {
  reactionId: ReactionId;
  isHidden: boolean;
  reactionPathComponents: ReactionPathComponents;
  sidebarInfo: ReactionSidebarInfo;
  onFormClose: () => void;
  onSetFormDirty: (pathComponents: ReactionPathComponents, value: boolean) => void;
}

export function ReactionEntityForm({
  reactionId,
  reactionPathComponents,
  sidebarInfo,
  isHidden,
  onFormClose,
  onSetFormDirty,
}: Readonly<ReactionEntityFormProps>) {
  const dispatch = useAppDispatch();

  const contextValue = useMemo(
    (): ReactionEntityContext => ({
      reactionId,
      pathComponents: reactionPathComponents,
    }),
    [reactionId, reactionPathComponents],
  );

  const formEntity = sidebarInfo.entityName;
  const transform = getReactionEntityTransform(formEntity);

  const initialValues = sidebarInfo.useInitialValues(reactionId, reactionPathComponents);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { ...initialValues },
    transformValues: transform,
  });
  const { watch, getValues, getInputProps, setValues, resetDirty } = form;
  const formMethods = useMemo(
    () => ({
      watch,
      getValues,
      getInputProps,
      setValues,
      resetDirty,
    }),
    [getInputProps, getValues, resetDirty, setValues, watch],
  );

  const isDirty = form.isDirty();

  useEffect(() => {
    onSetFormDirty(reactionPathComponents, isDirty);
  }, [isDirty, onSetFormDirty, reactionPathComponents]);

  const formDefinition = reactionEntityToForm[formEntity];

  const onSubmit = useCallback(
    (values: object) => {
      formMethods.resetDirty();
      onSetFormDirty(reactionPathComponents, false);
      dispatch(addUpdateReactionField({ reactionId, pathComponents: reactionPathComponents, newValue: values }));
    },
    [dispatch, formMethods, onSetFormDirty, reactionId, reactionPathComponents],
  );

  return (
    <reactionEntityContext.Provider value={contextValue}>
      {isHidden ? null : (
        <Form
          className={classes.wrapper}
          form={form}
          onSubmit={onSubmit}
        >
          <Flex
            className={classes.content}
            direction="column"
            gap="sm"
          >
            {formDefinition.map((input, index) => (
              <ReactionEntityBaseNode
                key={index}
                node={input}
                formMethods={formMethods}
              />
            ))}
          </Flex>
          <Flex
            align="center"
            justify="flex-end"
            gap="lg"
            className={classes.actions}
          >
            <Button
              variant="default"
              onClick={onFormClose}
            >
              Close
            </Button>
            <Button
              type="submit"
              color="primary"
            >
              Save
            </Button>
          </Flex>
        </Form>
      )}
    </reactionEntityContext.Provider>
  );
}
