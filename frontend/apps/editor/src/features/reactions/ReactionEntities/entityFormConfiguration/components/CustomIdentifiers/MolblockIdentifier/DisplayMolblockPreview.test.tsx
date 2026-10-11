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
import type { ReactionCompoundIdentifier } from '@open-reaction-database/ui/reaction/model';
import { renderWithMantine } from '@open-reaction-database/ui/testing';
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

  it('shows nothing, not the previous structure, when a molblock cannot be rendered', async () => {
    let failRender: ((error: Error) => void) | undefined;
    const failure = new Promise<PreviewsById>((_resolve, reject) => {
      failRender = reject;
    });
    renderPreviewsMock
      .mockResolvedValueOnce({ molblock: 'PHN2Zz4=' })
      .mockReturnValueOnce(failure);
    const { findByRole, queryByRole, rerender } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('MOL 1')} />,
    );
    expect(await findByRole('img', { name: 'drawn' })).toBeInTheDocument();
    rerender(<DisplayMolblockPreview identifier={identifier('MOL 2')} />);
    // Fail the render, and let the failure settle before looking.
    await act(async () => {
      failRender?.(new Error('no wasm'));
      await failure.catch(() => undefined);
    });
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
    const first = new Promise<PreviewsById>(resolve => {
      finishFirst = resolve;
    });
    renderPreviewsMock
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce({ molblock: 'U0VDT05E' });
    const { findByRole, getByRole, rerender } = renderWithMantine(
      <DisplayMolblockPreview identifier={identifier('MOL 1')} />,
    );
    rerender(<DisplayMolblockPreview identifier={identifier('MOL 2')} />);
    expect(await findByRole('img')).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,U0VDT05E',
    );
    // The component's handler for the first render runs before act's await on it returns.
    await act(() => {
      finishFirst?.({ molblock: 'RklSU1Q=' });
      return first;
    });
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'data:image/svg+xml;base64,U0VDT05E',
    );
  });
});
