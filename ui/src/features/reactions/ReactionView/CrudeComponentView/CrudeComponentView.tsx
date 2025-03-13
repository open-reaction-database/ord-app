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
import type { ReactionCrudeComponent } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import { Anchor } from '@mantine/core';
import { useAppDispatch } from 'store/useAppDispatch';
import { searchReaction } from 'store/entities/reactions/reactions.thunks.ts';

interface CrudeComponentViewProps {
  crudeComponent: ReactionCrudeComponent;
}

export function CrudeComponentView({ crudeComponent }: Readonly<CrudeComponentViewProps>) {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(searchReaction(crudeComponent.reactionId ?? ''));
  };

  return <Anchor onClick={onClick}>{crudeComponent.reactionId}</Anchor>;
}
