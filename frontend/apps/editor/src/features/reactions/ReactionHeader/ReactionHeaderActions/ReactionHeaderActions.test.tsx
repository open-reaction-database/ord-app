/*
 * Copyright 2026 Open Reaction Database Project Authors
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
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import {
  ReactionProvider,
  createStaticReactionSource,
} from '@open-reaction-database/ui/reaction';
import { emptyReactionData } from '@open-reaction-database/ui/testing';
import { renderWithProviders } from 'test/renderWithProviders.tsx';
import { ReactionHeaderActions } from './ReactionHeaderActions.tsx';

describe('ReactionHeaderActions', () => {
  it('reads the reaction from its provider, not the store', () => {
    const source = createStaticReactionSource({
      data: emptyReactionData(),
      previews: {},
      summary: { provenance: {}, summary: {}, conditions: '' },
      pb_reaction_id: 'ord-1',
    });
    // The store holds no reactions; only the provider has this one.
    const { getByRole } = renderWithProviders(
      <ReactionProvider
        reactionId={7}
        source={source}
        slots={{
          ViewDeleteButtons: () => null,
          ValueLabel: () => null,
          ViewOnlyLabel: () => null,
        }}
      >
        <ReactionHeaderActions
          reactionId={7}
          previewRef={createRef<HTMLDivElement>()}
        />
      </ReactionProvider>,
    );
    fireEvent.click(getByRole('button', { name: /Save as a Template/ }));
    expect(getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'ord-1 Template',
    );
  });
});
