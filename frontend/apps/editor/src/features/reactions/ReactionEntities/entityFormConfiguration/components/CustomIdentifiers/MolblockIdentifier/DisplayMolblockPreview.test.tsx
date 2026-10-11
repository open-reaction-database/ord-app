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
import { act } from '@testing-library/react';
import type { PreviewsById } from '@open-reaction-database/ui/reaction/previews';
import type { ReactionCompoundIdentifier } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { DisplayMolblockPreview } from './DisplayMolblockPreview.tsx';

const { renderPreviewsMock } = vi.hoisted(() => ({ renderPreviewsMock: vi.fn() }));
vi.mock('@open-reaction-database/ui/reaction/previews', () => ({
  renderPreviews: renderPreviewsMock,
}));

const identifier = (value: string) =>
  ({
    value,
    details: 'drawn',
    type: 'MOLBLOCK',
  }) as unknown as ReactionCompoundIdentifier;

describe('DisplayMolblockPreview', () => {
  it('shows the rendered molblock at 80 px', async () => {
    renderPreviewsMock.mockResolvedValue({ molblock: 'PHN2Zz4=' });
    const { findByRole } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('MOL')} />,
    );
    expect(await findByRole('img', { name: 'drawn' })).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,PHN2Zz4=',
    );
    expect(renderPreviewsMock).toHaveBeenCalledWith({ molblock: 'MOL' }, { size: 80 });
  });

  it('shows nothing when the molblock cannot be rendered', async () => {
    renderPreviewsMock.mockRejectedValue(new Error('no wasm'));
    const { queryByRole } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('MOL')} />,
    );
    await vi.waitFor(() => expect(renderPreviewsMock).toHaveBeenCalled());
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty molblock', () => {
    const { queryByRole } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('')} />,
    );
    expect(renderPreviewsMock).not.toHaveBeenCalled();
    expect(queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps the newest molblock when an earlier render finishes last', async () => {
    let finishFirst: ((svgsById: PreviewsById) => void) | undefined;
    renderPreviewsMock
      .mockImplementationOnce(
        () =>
          new Promise<PreviewsById>(resolve => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ molblock: 'U0VDT05E' });
    const { findByRole, getByRole, rerender } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('MOL 1')} />,
    );
    rerender(<DisplayMolblockPreview identifier={identifier('MOL 2')} />);
    expect(await findByRole('img')).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,U0VDT05E',
    );
    await act(async () => finishFirst?.({ molblock: 'RklSU1Q=' }));
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,U0VDT05E',
    );
  });
});
