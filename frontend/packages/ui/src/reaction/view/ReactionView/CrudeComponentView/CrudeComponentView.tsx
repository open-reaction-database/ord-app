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
import type { ReactionCrudeComponent } from '#reaction/model/reactionsInputs/reactionInputs.types.ts';
import { useReactionSlots } from '#reaction/provider/reactionProvider.hooks.ts';

interface CrudeComponentViewProps {
  crudeComponent: ReactionCrudeComponent;
}

export function CrudeComponentView({
  crudeComponent,
}: Readonly<CrudeComponentViewProps>) {
  const { ReactionLink } = useReactionSlots();
  const pbReactionId = crudeComponent.reactionId ?? '';
  // Without an ID there is nothing to link to.
  return ReactionLink && pbReactionId ? (
    <ReactionLink pbReactionId={pbReactionId} />
  ) : (
    <span>{pbReactionId}</span>
  );
}
