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
import { useSelector } from 'react-redux';
import { selectReactionById } from 'store/entities/reactions/reactions.selectors.ts';
import { reactionEntityToForm } from 'features/reactions/ReactionDetailsSidebar/reactionEntities/reactionEntityToForm.models.ts';
import { ReactionFormNode } from '../../../../common/components/inputs/ReactionFormNode/ReactionFormNode.tsx';
import { Button, Flex } from '@mantine/core';
import classes from './sidebarForm.module.scss';
import { addUpdateReactionField } from 'store/entities/reactions/reactions.thunks.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';
import { useSidebarInfo } from 'common/hooks/useSidebarInfo.tsx';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

interface SidebarFormProps {
  reactionId: number;
  isHidden: boolean;
  reactionPathComponents: ReactionPathComponents;
  onFormClose: () => void;
}

export function SidebarForm({ reactionId, reactionPathComponents, isHidden, onFormClose }: Readonly<SidebarFormProps>) {
  const dispatch = useAppDispatch();

  const currentSidebarInfo = useSidebarInfo(reactionPathComponents);
  const formEntity = currentSidebarInfo.entityName;

  const reaction = useSelector(selectReactionById(reactionId));
  const initialValues = reactionPathComponents.reduce(
    (acc: object, key) => (acc !== null ? Reflect.get(acc, key) || null : null),
    reaction.data,
  );
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { ...initialValues },
  });

  const formDefinition = reactionEntityToForm[formEntity];

  const onSubmit = (values: object) => {
    dispatch(addUpdateReactionField({ reactionId, pathComponents: reactionPathComponents, newValue: values }));
  };

  return isHidden ? null : (
    <Form
      className={classes.wrapper}
      form={form}
      onSubmit={onSubmit}
    >
      <Flex
        direction="column"
        gap="sm"
      >
        {formDefinition.map((input, index) => (
          <ReactionFormNode
            key={index}
            node={input}
            getInputProps={form.getInputProps}
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
  );
}
