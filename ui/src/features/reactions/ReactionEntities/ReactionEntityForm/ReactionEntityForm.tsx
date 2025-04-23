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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import type { ReactionSidebarInfo } from 'features/reactions/ReactionEntities/sidebarInfo/sidebarInfo.types.ts';
import { reactionContext } from '../../reactions.context.ts';
import { copyReactionPart } from './reactionEntityForm.utils.ts';
import { ReactionEntityPaste } from './ReactionEntityPaste.tsx';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { useReactionEntityValidation } from '../entityFormConfiguration/reactionEntityToValidation.ts';

interface ReactionEntityFormProps {
  isHidden: boolean;
  reactionPathComponents: ReactionPathComponents;
  sidebarInfo: ReactionSidebarInfo;
  onFormClose: () => void;
  onSetFormDirty: (pathComponents: ReactionPathComponents, value: boolean) => void;
}

export function ReactionEntityForm({
  reactionPathComponents,
  sidebarInfo,
  isHidden,
  onFormClose,
  onSetFormDirty,
}: Readonly<ReactionEntityFormProps>) {
  const { reactionId, isViewOnly, isTemplate } = useContext(reactionContext);
  const dispatch = useAppDispatch();
  const [pasteOpened, { open, close }] = useDisclosure();
  // Dirty hack to reset all the components within form during paste operation
  // Since form is uncontrolled some components are not visually updated when form is reset
  // This hack allows us to rerender those components from scratch
  const [formKey, setFormKey] = useState(crypto.randomUUID());

  const contextValue = useMemo(
    (): ReactionEntityContext => ({
      reactionId,
      pathComponents: reactionPathComponents,
    }),
    [reactionId, reactionPathComponents],
  );

  const formEntity = sidebarInfo.entityName;
  const validate = useReactionEntityValidation(reactionId, reactionPathComponents, formEntity);

  const [initialValues, reactionPartWithNestedEntities, filterValues] = sidebarInfo.useInitialValues(
    reactionId,
    reactionPathComponents,
  );

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { ...initialValues },
    validate,
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
      // Safeguard to prevent submitting template or view only reaction in case some field is editable
      if (isViewOnly) return;
      formMethods.resetDirty();
      onSetFormDirty(reactionPathComponents, false);
      dispatch(addUpdateReactionField({ reactionId, pathComponents: reactionPathComponents, newValue: values }));
    },
    [dispatch, formMethods, isViewOnly, onSetFormDirty, reactionId, reactionPathComponents],
  );

  const onPasteChunk = useCallback(
    (reactionPart: object) => {
      try {
        const formValues = filterValues(reactionPart);
        form.setValues(formValues);
        onSubmit(reactionPart);
        setFormKey(crypto.randomUUID());
      } catch (_e: unknown) {
        showNotification({
          variant: NotificationVariant.ERROR,
          message: 'Failed to paste chunk',
        });
      }
    },
    [filterValues, form, onSubmit],
  );

  return (
    <reactionEntityContext.Provider value={contextValue}>
      {isHidden ? null : (
        <Form
          className={classes.wrapper}
          form={form}
          onSubmit={onSubmit}
          key={formKey}
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
            {!isTemplate && (
              <Button onClick={() => copyReactionPart(sidebarInfo.entityName, reactionPartWithNestedEntities)}>
                Copy Chunk
              </Button>
            )}
            {!isViewOnly && <Button onClick={open}>Paste Chunk</Button>}
            <Button
              variant="default"
              onClick={onFormClose}
            >
              Close
            </Button>
            {!isViewOnly && (
              <Button
                type="submit"
                color="primary"
              >
                Save
              </Button>
            )}
          </Flex>
        </Form>
      )}
      {pasteOpened && (
        <ReactionEntityPaste
          name={sidebarInfo.label}
          entityField={sidebarInfo.entityName}
          onClose={close}
          onSave={onPasteChunk}
        />
      )}
    </reactionEntityContext.Provider>
  );
}
