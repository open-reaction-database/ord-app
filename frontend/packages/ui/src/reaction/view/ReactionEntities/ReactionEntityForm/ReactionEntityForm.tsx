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
import type { ReactionPathComponents } from '#reaction/model/reactionPathComponents.ts';
import {
  ReactionEntityBaseNode,
  reactionEntityToForm,
} from '#reaction/view/ReactionEntities/index.ts';
import {
  reactionEntityContext,
  type ReactionEntityContext,
} from '#reaction/view/ReactionEntities/reactionEntity.context.ts';
import {
  useIsTemplate,
  useIsViewOnly,
  useReactionActions,
} from '#reaction/provider/reactionProvider.hooks.ts';
import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactionSidebarInfo } from '#reaction/view/ReactionEntities/sidebarInfo/sidebarInfo.types.ts';
import { copyReactionPart } from './reactionEntityForm.utils.ts';
import { ReactionEntityPaste } from './ReactionEntityPaste.tsx';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '#display/utils/showNotification.tsx';
import { NotificationVariant } from '#display/types/notification.ts';
import { useReactionEntityValidation } from '#reaction/view/ReactionEntities/entityFormConfiguration/reactionEntityToValidation.ts';

interface ReactionEntityFormProps {
  isHidden: boolean;
  reactionPathComponents: ReactionPathComponents;
  sidebarInfo: ReactionSidebarInfo;
  /** Closes the form; without it, the form offers no Close or Save and Close. */
  onFormClose?: () => void;
  onSetFormDirty: (pathComponents: ReactionPathComponents, value: boolean) => void;
}

export function ReactionEntityForm({
  reactionPathComponents,
  sidebarInfo,
  isHidden,
  onFormClose,
  onSetFormDirty,
}: Readonly<ReactionEntityFormProps>) {
  const actions = useReactionActions();
  const isViewOnly = useIsViewOnly();
  const isTemplate = useIsTemplate();
  const [pasteOpened, { open, close }] = useDisclosure();
  // Dirty hack to reset all the components within form during paste operation
  // Since form is uncontrolled some components are not visually updated when form is reset
  // This hack allows us to rerender those components from scratch
  const [formKey, setFormKey] = useState(crypto.randomUUID());

  const contextValue = useMemo(
    (): ReactionEntityContext => ({ pathComponents: reactionPathComponents }),
    [reactionPathComponents],
  );

  const formEntity = sidebarInfo.entityName;
  const validate = useReactionEntityValidation(reactionPathComponents, formEntity);

  const [initialValues, reactionPartWithNestedEntities, filterValues] =
    sidebarInfo.useInitialValues(reactionPathComponents);

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
      // A form is submitted only for an editable reaction, even if some field stayed editable.
      if (!actions) return;
      formMethods.resetDirty();
      onSetFormDirty(reactionPathComponents, false);
      void actions.update(reactionPathComponents, values);
    },
    [actions, formMethods, onSetFormDirty, reactionPathComponents],
  );

  const onPasteChunk = useCallback(
    (reactionPart: object) => {
      try {
        // Submit the filtered values, not the raw clipboard chunk: fields the sidebar excludes
        // (e.g. setup.automationCode, provenance.recordModified, product.measurements) are edited
        // in their own sidebars and must not be merged in here, or they get duplicated/retained.
        const formValues = filterValues(reactionPart);
        form.setValues(formValues);
        onSubmit(formValues);
        setFormKey(crypto.randomUUID());
      } catch {
        showNotification({
          variant: NotificationVariant.ERROR,
          message: 'Failed to paste chunk',
        });
      }
    },
    [filterValues, form, onSubmit],
  );

  // Save the form and, only if it validated, close it (returning to the parent sidebar level),
  // when it has an onFormClose. Mirrors the validate-then-submit gating the Save button gets from
  // <Form>. (#550)
  const handleSaveAndClose = useCallback(() => {
    if (!actions) return;
    const { hasErrors } = form.validate();
    if (hasErrors) return;
    onSubmit(form.getValues());
    onFormClose?.();
  }, [actions, form, onSubmit, onFormClose]);

  // Cmd/Ctrl+Enter triggers Save and Close, which only saves when the form has no onFormClose.
  // Scoped to this form's DOM subtree (not a global hotkey) so hidden sibling forms in the mounted
  // sidebar stack don't also fire. (#550)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLFormElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSaveAndClose();
      }
    },
    [handleSaveAndClose],
  );

  return (
    <reactionEntityContext.Provider value={contextValue}>
      {isHidden ? null : (
        <Form
          className={classes.wrapper}
          form={form}
          onSubmit={onSubmit}
          onKeyDown={handleKeyDown}
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
              <Button
                onClick={() =>
                  copyReactionPart(
                    sidebarInfo.entityName,
                    reactionPartWithNestedEntities,
                  )
                }
                disabled={isDirty}
              >
                Copy Chunk
              </Button>
            )}
            {!isViewOnly && <Button onClick={open}>Paste Chunk</Button>}
            {onFormClose && (
              <Button
                variant="default"
                onClick={onFormClose}
              >
                Close
              </Button>
            )}
            {!isViewOnly && (
              <Button
                type="submit"
                color="primary"
              >
                Save
              </Button>
            )}
            {!isViewOnly && onFormClose && (
              <Button
                color="primary"
                onClick={handleSaveAndClose}
              >
                Save and Close
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
