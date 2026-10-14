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
import userEvent from '@testing-library/user-event';
import { renderAt } from '#test/render.tsx';
import { VIEWER0101 } from '#test/fixtures/records.ts';
import { FullRecordButton } from '#components/FullRecordButton.tsx';
import { fullRecordJson } from '#reaction/fullRecordJson.ts';

describe('fullRecordJson', () => {
  it("is the reaction in ord-schema's JSON", () => {
    const json = JSON.parse(fullRecordJson(VIEWER0101));
    expect(json.reactionId).toBe('ord-viewer0101');
    expect(json.inputs.reactants.components).toHaveLength(2);
  });
});

describe('FullRecordButton', () => {
  it('shows the record in a modal', async () => {
    const user = userEvent.setup();
    const { getByRole, findByRole } = renderAt(
      '/',
      <FullRecordButton record={VIEWER0101} />,
    );
    await user.click(getByRole('button', { name: 'Full record' }));
    expect(await findByRole('dialog')).toHaveTextContent(
      '"reactionId": "ord-viewer0101"',
    );
  });
});
