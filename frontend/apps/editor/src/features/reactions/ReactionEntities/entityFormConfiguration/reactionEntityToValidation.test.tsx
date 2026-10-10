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
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import { rootReducer } from 'store/rootReducer.ts';
import type { AppState } from 'store/configureAppStore.ts';
import { useReactionEntityValidation } from './reactionEntityToValidation.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';

const store = configureStore({
  reducer: rootReducer,
  preloadedState: {
    entities: {
      reactions: {
        reactionsById: {
          1: {
            id: 1,
            data: {
              inputs: {
                in1: { id: 'in1', name: 'Existing' },
                in2: { id: 'in2', name: 'Other' },
              },
            },
          },
        },
      },
    },
  } as unknown as AppState,
});

const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
  <Provider store={store}>{children}</Provider>
);

const renderValidate = (entity: ReactionNodeEntity, pathComponents: Array<string>) =>
  renderHook(() => useReactionEntityValidation(1, pathComponents, entity), { wrapper })
    .result.current;

describe('useReactionEntityValidation', () => {
  it('rejects a name that duplicates another sibling entity', () => {
    const validate = renderValidate(ReactionNodeEntity.Inputs, ['inputs', 'in2']);
    expect(validate({ name: 'Existing' }).name).toBeTruthy();
  });

  it('accepts a genuinely new, unique name', () => {
    const validate = renderValidate(ReactionNodeEntity.Inputs, ['inputs', 'in2']);
    expect(validate({ name: 'Brand New' }).name).toBeFalsy();
  });

  it("excludes the entity's own current name from the uniqueness set", () => {
    const validate = renderValidate(ReactionNodeEntity.Inputs, ['inputs', 'in2']);
    // 'Other' is in2's own current name, so re-using it is allowed.
    expect(validate({ name: 'Other' }).name).toBeFalsy();
  });

  it('falls back to an empty (always-valid) schema for entities without a rule', () => {
    const validate = renderValidate(ReactionNodeEntity.Outcomes, ['outcomes', '0']);
    expect(validate({ name: 'anything' })).toEqual({});
  });
});
