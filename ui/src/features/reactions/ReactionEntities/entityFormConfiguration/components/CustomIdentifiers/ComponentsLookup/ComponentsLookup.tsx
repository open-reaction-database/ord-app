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
import { Anchor, Button, Flex, Modal, Text, TextInput } from '@mantine/core';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { addIdentifierByName } from 'store/entities/reactions/reactionsInputs/reactionInputs.thunks.ts';
import { useContext, useEffect, type FormEvent } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { useSelector } from 'react-redux';
import {
  selectHasReactionLookupError,
  selectReactionLookupIsLoading,
} from 'store/features/reactionLookup/reactionLookup.selectors.ts';
import { resetReactionLookupErrorAction } from 'store/features/reactionLookup/reactionLookup.actions.ts';
import classes from './componentsLookup.module.scss';
import { NavigateOutsideIcon } from 'common/icons';

interface ComponentsLookupProps {
  onClose: () => void;
}

export function ComponentsLookup({ onClose }: Readonly<ComponentsLookupProps>) {
  const dispatch = useAppDispatch();
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const isLoading = useSelector(selectReactionLookupIsLoading);
  const hasError = useSelector(selectHasReactionLookupError);

  const form = useForm({
    mode: 'controlled',
    clearInputErrorOnChange: true,
    initialValues: {
      search: '',
    },
  });

  const { setFieldError, values } = form;

  useEffect(() => {
    if (hasError) {
      setFieldError('search', 'Compound not found');
    }
  }, [hasError, setFieldError]);

  useEffect(() => {
    if (hasError && values.search.length > 0) {
      dispatch(resetReactionLookupErrorAction());
    }
  }, [dispatch, hasError, values.search]);

  const onSubmit = (values: { search: string }, event?: FormEvent<HTMLFormElement>) => {
    event?.stopPropagation();
    const path = pathComponents.concat('identifiers');
    dispatch(addIdentifierByName({ reactionId: reactionId, pathComponents: path, name: values.search }));
  };

  const inputProps = form.getInputProps('search');

  return (
    <Modal
      opened
      title="Add Component"
      onClose={onClose}
      classNames={{ content: classes.content }}
    >
      <Form
        form={form}
        onSubmit={onSubmit}
        className={classes.wrapper}
      >
        <Text className={classes.description}>
          Searching in
          <Anchor
            target="_blank"
            href="https://pubchem.ncbi.nlm.nih.gov/"
          >
            <NavigateOutsideIcon /> PubChem
          </Anchor>
          <Anchor
            target="_blank"
            href="https://cactus.nci.nih.gov/chemical/structure"
          >
            <NavigateOutsideIcon /> CACTUS
          </Anchor>
          <Anchor
            target="_blank"
            href="https://search.emolecules.com/"
          >
            <NavigateOutsideIcon /> eMolecules
          </Anchor>
          databases
        </Text>
        <TextInput
          label="Compound name"
          {...inputProps}
          error={hasError ? 'Compound not found' : inputProps.error}
        />
        <Flex
          justify="flex-end"
          gap="sm"
        >
          <Button
            onClick={onClose}
            variant="default"
          >
            Cancel
          </Button>
          <Button
            loading={isLoading}
            type="submit"
          >
            Save
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
}
