/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { ReactionEntityData } from './ReactionEntityData.tsx';
import { AppDataType } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import type { ReactionEntityNodeProps } from '../reactionEntityNode.types.ts';
import type { ReactionFormData } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const node = {
  fieldName: 'data',
  nameFieldName: 'name',
  wrapperConfig: { label: 'Data' },
} as unknown as ReactionFormData;
const formMethods = {
  getInputProps: (field: string) =>
    field === 'name'
      ? { value: '', onChange: vi.fn() }
      : { value: { type: AppDataType.Text, value: '' }, onChange: vi.fn() },
} as unknown as ReactionEntityNodeProps<ReactionFormData>['formMethods'];

describe('ReactionEntityData', () => {
  it('renders the data-type selector and a text value control for Text data', () => {
    const { getByText, getByRole } = renderInReactionView(
      <ReactionEntityData
        node={node}
        formMethods={formMethods}
      />,
    );
    // Segmented control exposes each data type as a radio option.
    expect(getByText('Text')).toBeInTheDocument();
    expect(getByText('Number')).toBeInTheDocument();
    // The value control for the Text type is a text input (role=textbox; the selector uses radios).
    expect(getByRole('textbox')).toBeInTheDocument();
  });
});
