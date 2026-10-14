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
import { renderAt } from '#test/render.tsx';
import { ApiError } from '#api/client.ts';
import { ErrorNotice } from '#components/ErrorNotice.tsx';

describe('ErrorNotice', () => {
  it('says what errorMessage says about the failure', () => {
    const { getByRole } = renderAt(
      '/',
      <ErrorNotice error={new ApiError(503, 'busy')} />,
    );
    expect(getByRole('alert')).toHaveTextContent(
      'The service is busy or unavailable; try again shortly.',
    );
  });

  it("explains nginx's own 502 while the backend starts", () => {
    const { getByRole } = renderAt(
      '/',
      <ErrorNotice error={new ApiError(502, 'Bad Gateway', false)} />,
    );
    expect(getByRole('alert')).toHaveTextContent('busy or unavailable');
  });
});
