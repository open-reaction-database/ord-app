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
import { compileQuery } from '#search/compile.ts';
import { EMPTY_FORM, type SearchForm } from '#search/form.ts';

const ORDER = [{ key: 'reaction_id' }];

function where(form: Partial<SearchForm>) {
  return compileQuery({ ...EMPTY_FORM, ...form })?.where;
}

function inputs(predicate: object) {
  return { op: 'exists', path: 'inputs.components', where: predicate };
}

describe('compileQuery', () => {
  it('compiles nothing for an empty form', () => {
    expect(compileQuery(EMPTY_FORM)).toBeNull();
  });

  it('compiles nothing for a blank structure and full ranges', () => {
    expect(
      compileQuery({
        ...EMPTY_FORM,
        structures: [{ pattern: '  ', target: 'input', mode: 'exact' }],
      }),
    ).toBeNull();
  });

  it('compiles nothing for a blank reaction SMARTS', () => {
    expect(compileQuery({ ...EMPTY_FORM, reactionSmarts: [' '] })).toBeNull();
  });

  it('compiles nothing for blank dataset IDs, DOIs, and reaction IDs', () => {
    expect(
      compileQuery({ ...EMPTY_FORM, datasetIds: [''], dois: [' '], reactionIds: [''] }),
    ).toBeNull();
  });

  it('orders by reaction ID and keeps the limit', () => {
    expect(compileQuery({ ...EMPTY_FORM, reactionIds: ['ord-1'], limit: 250 })).toEqual(
      {
        where: {
          op: 'or',
          clauses: [{ op: 'eq', path: 'reaction_id', value: { literal: 'ord-1' } }],
        },
        order_by: ORDER,
        limit: 250,
      },
    );
  });

  it.each([
    ['exact', { op: 'same_compound', path: 'smiles', smiles: 'CCN' }],
    ['similar', { op: 'similarity', path: 'smiles', smiles: 'CCN', threshold: 0.5 }],
    [
      'substructure',
      { op: 'substructure', path: 'smiles', smarts: 'CCN', chirality: false },
    ],
    ['smarts', { op: 'substructure', path: 'smiles', smarts: 'CCN', chirality: false }],
  ] as const)('compiles an %s input structure', (mode, predicate) => {
    expect(where({ structures: [{ pattern: 'CCN', target: 'input', mode }] })).toEqual(
      inputs(predicate),
    );
  });

  it('looks for a product structure among the outcomes', () => {
    expect(
      where({ structures: [{ pattern: 'CCN', target: 'output', mode: 'exact' }] }),
    ).toEqual({
      op: 'exists',
      path: 'outcomes.products',
      where: { op: 'same_compound', path: 'smiles', smiles: 'CCN' },
    });
  });

  it('carries the similarity threshold and stereochemistry', () => {
    expect(
      where({
        structures: [
          { pattern: 'CCN', target: 'input', mode: 'similar' },
          { pattern: 'N', target: 'input', mode: 'substructure' },
        ],
        similarity: 0.8,
        useStereochemistry: true,
      }),
    ).toEqual({
      op: 'and',
      clauses: [
        inputs({ op: 'similarity', path: 'smiles', smiles: 'CCN', threshold: 0.8 }),
        inputs({ op: 'substructure', path: 'smiles', smarts: 'N', chirality: true }),
      ],
    });
  });

  it('compiles a reaction SMARTS', () => {
    expect(where({ reactionSmarts: ['[N:1]>>[N:1]'] })).toEqual({
      op: 'reaction_smarts',
      smarts: '[N:1]>>[N:1]',
      chirality: false,
    });
  });

  it("compiles a yield range over the products' yield measurements", () => {
    expect(where({ yieldRange: [70, 100] })).toEqual({
      op: 'exists',
      path: 'outcomes.products',
      where: {
        op: 'exists',
        path: 'measurements',
        where: {
          op: 'and',
          clauses: [
            { op: 'eq', path: 'type', value: { literal: 'YIELD' } },
            { op: 'ge', path: 'percentage.value', value: { literal: 70 } },
            { op: 'le', path: 'percentage.value', value: { literal: 100 } },
          ],
        },
      },
    });
  });

  it("compiles a conversion range over the outcomes' conversion", () => {
    expect(where({ conversionRange: [0, 50] })).toEqual({
      op: 'exists',
      path: 'outcomes',
      where: {
        op: 'and',
        clauses: [
          { op: 'ge', path: 'conversion.value', value: { literal: 0 } },
          { op: 'le', path: 'conversion.value', value: { literal: 50 } },
        ],
      },
    });
  });

  it.each([
    ['datasetIds', 'dataset_id'],
    ['dois', 'provenance.doi'],
    ['reactionIds', 'reaction_id'],
  ] as const)('matches any of the %s', (field, path) => {
    expect(where({ [field]: ['a', 'b'] })).toEqual({
      op: 'or',
      clauses: [
        { op: 'eq', path, value: { literal: 'a' } },
        { op: 'eq', path, value: { literal: 'b' } },
      ],
    });
  });

  it('joins the fields with and', () => {
    const compiled = where({ datasetIds: ['a'], yieldRange: [50, 100] });
    expect(compiled).toMatchObject({ op: 'and' });
    expect((compiled as { clauses: Array<unknown> }).clauses).toHaveLength(2);
  });
});
