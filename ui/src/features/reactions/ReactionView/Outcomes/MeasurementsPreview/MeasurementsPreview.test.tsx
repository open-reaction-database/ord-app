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
import { renderWithMantine } from 'test/renderWithMantine.tsx';
import { MeasurementsPreview } from './MeasurementsPreview.tsx';
import type { ReactionProduct } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';

const product = {
  measurements: [
    { id: 'm1', type: 'IDENTITY', analysis: { name: 'NMR' }, value: { type: 'String', value: 'clear liquid' } },
    { id: 'm2', type: 'AREA', analysis: { name: 'HPLC' }, value: { type: '%', value: { value: 90 } } },
  ],
} as unknown as ReactionProduct;

describe('MeasurementsPreview', () => {
  it('renders each measurement type, analysis name, and value', () => {
    const { getByText } = renderWithMantine(<MeasurementsPreview product={product} />);
    expect(getByText('IDENTITY')).toBeInTheDocument();
    expect(getByText('NMR')).toBeInTheDocument();
    expect(getByText('clear liquid')).toBeInTheDocument();
    expect(getByText('AREA')).toBeInTheDocument();
    expect(getByText('HPLC')).toBeInTheDocument();
    expect(getByText('90 %')).toBeInTheDocument();
  });
});
