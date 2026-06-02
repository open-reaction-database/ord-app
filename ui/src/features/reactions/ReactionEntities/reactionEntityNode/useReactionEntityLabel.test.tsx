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
import { isValidElement } from 'react';
import { useReactionEntityLabel } from './useReactionEntityLabel.tsx';
import type { ReactionFormStandaloneField } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';

const field = (label: unknown): ReactionFormStandaloneField => ({ label }) as ReactionFormStandaloneField;

describe('useReactionEntityLabel', () => {
  it('returns null when no config is provided', () => {
    expect(useReactionEntityLabel(undefined)).toBeNull();
  });

  it('returns null when the config has no label', () => {
    expect(useReactionEntityLabel(field(undefined))).toBeNull();
  });

  it('renders a label element when a label is present', () => {
    const result = useReactionEntityLabel(field('Yield'));
    expect(isValidElement(result)).toBe(true);
  });
});
