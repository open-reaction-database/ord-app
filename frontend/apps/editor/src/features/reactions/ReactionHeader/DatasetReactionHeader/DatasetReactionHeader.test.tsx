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
import { renderInReactionView } from 'test/renderInReactionView.tsx';
import { DatasetReactionHeader } from './DatasetReactionHeader.tsx';

const record = { pb_reaction_id: 'ord-123', is_valid: true, validation: null };

describe('DatasetReactionHeader', () => {
  it('offers Remove only when the reaction is editable', () => {
    const editable = renderInReactionView(
      <DatasetReactionHeader
        datasetId={2}
        reactionId={1}
      />,
      { record },
    );
    expect(editable.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(editable.getByText('Save as Template')).toBeInTheDocument();
    expect(editable.getByText('Download Reaction')).toBeInTheDocument();
    editable.unmount();

    const readOnly = renderInReactionView(
      <DatasetReactionHeader
        datasetId={2}
        reactionId={1}
      />,
      { record, isViewOnly: true },
    );
    expect(readOnly.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(readOnly.getByText('Save as Template')).toBeInTheDocument();
  });
});
