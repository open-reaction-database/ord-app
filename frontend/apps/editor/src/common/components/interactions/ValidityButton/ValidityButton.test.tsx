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
import { screen, fireEvent } from '@testing-library/react';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { ValidityButton } from './ValidityButton.tsx';

describe('ValidityButton', () => {
  it('shows the valid text and fires onClick when clickable', () => {
    const onClick = vi.fn();
    renderWithMantine(
      <ValidityButton
        isValid
        validText="Valid"
        invalidText="Invalid"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /valid/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows the invalid text when not valid', () => {
    renderWithMantine(
      <ValidityButton
        isValid={false}
        validText="Valid"
        invalidText="Invalid"
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('renders a non-interactive badge (no button) when isNotClickable', () => {
    renderWithMantine(
      <ValidityButton
        isValid
        validText="Valid"
        invalidText="Invalid"
        onClick={() => {}}
        isNotClickable
      />,
    );
    expect(screen.getByText('Valid')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
