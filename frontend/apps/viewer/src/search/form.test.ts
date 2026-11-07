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
import {
  EMPTY_FORM,
  formFromParams,
  paramsFromForm,
  searchPath,
  type SearchForm,
} from '#search/form.ts';

function parse(query: string): SearchForm {
  return formFromParams(new URLSearchParams(query));
}

function component(pattern: string, target: string, mode: string): string {
  return `component=${encodeURIComponent(JSON.stringify({ pattern, target, mode }))}`;
}

describe('formFromParams', () => {
  it('reads no parameters as the empty form', () => {
    expect(parse('')).toEqual(EMPTY_FORM);
  });

  it("reads ord-interface's JSON components", () => {
    expect(parse(component('CCN', 'input', 'exact')).structures).toEqual([
      { pattern: 'CCN', target: 'input', mode: 'exact' },
    ]);
  });

  it.each([
    ['CCN;input;exact', { pattern: 'CCN', target: 'input', mode: 'exact' }],
    ['CCN;OUTPUT;SIMILAR', { pattern: 'CCN', target: 'output', mode: 'similar' }],
    ['[C;R]Cl;input;smarts', { pattern: '[C;R]Cl', target: 'input', mode: 'smarts' }],
  ])('reads the legacy component %j, splitting from the right', (value, structure) => {
    expect(parse(`component=${encodeURIComponent(value)}`).structures).toEqual([
      structure,
    ]);
  });

  it.each([
    ['CCN;input'],
    ['CCN;sideways;exact'],
    ['CCN;input;fuzzy'],
    ['{"pattern": "CCN"}'],
    ['{not json'],
  ])('drops the component %j, which names no structure it can search', value => {
    expect(parse(`component=${encodeURIComponent(value)}`).structures).toEqual([]);
  });

  it('reads every other field', () => {
    const form = parse(
      [
        'use_stereochemistry=true',
        'similarity=0.7',
        'reaction_smarts=%5BN%3A1%5D%3E%3E%5BN%3A1%5D',
        'min_yield=40',
        'max_yield=90',
        'min_conversion=10',
        'max_conversion=20',
        'dataset_id=ord_dataset-1',
        'dataset_id=ord_dataset-2',
        'doi=10.1%2Fx',
        'reaction_id=ord-1',
        'limit=250',
      ].join('&'),
    );
    expect(form).toEqual({
      ...EMPTY_FORM,
      useStereochemistry: true,
      similarity: 0.7,
      reactionSmarts: ['[N:1]>>[N:1]'],
      yieldRange: [40, 90],
      conversionRange: [10, 20],
      datasetIds: ['ord_dataset-1', 'ord_dataset-2'],
      dois: ['10.1/x'],
      reactionIds: ['ord-1'],
      limit: 250,
    });
  });

  it.each([
    ['similarity=0', 'similarity', 0.5],
    ['similarity=1.5', 'similarity', 0.5],
    ['similarity=abc', 'similarity', 0.5],
    ['limit=0', 'limit', 100],
    ['limit=5000', 'limit', 1000],
    ['limit=12.7', 'limit', 12],
  ])('reads %j as a %s of %j', (query, key, value) => {
    expect(parse(query)[key as keyof SearchForm]).toBe(value);
  });

  it('reads a range past its bounds as within them', () => {
    expect(parse('min_yield=-5&max_yield=150').yieldRange).toEqual([0, 100]);
  });

  it('reads an empty bound as its default', () => {
    expect(parse('min_yield=&max_yield=').yieldRange).toEqual([0, 100]);
  });
});

describe('paramsFromForm', () => {
  it('writes nothing but the limit for the empty form', () => {
    expect(paramsFromForm(EMPTY_FORM).toString()).toBe('limit=100');
  });

  it('writes the stereochemistry and similarity with a structure', () => {
    const params = paramsFromForm({
      ...EMPTY_FORM,
      structures: [{ pattern: 'CCN', target: 'input', mode: 'similar' }],
    });
    expect(params.getAll('component')).toEqual([
      JSON.stringify({ pattern: 'CCN', target: 'input', mode: 'similar' }),
    ]);
    expect(params.get('use_stereochemistry')).toBe('false');
    expect(params.get('similarity')).toBe('0.5');
  });

  it('writes the stereochemistry with a reaction SMARTS', () => {
    const form = {
      ...EMPTY_FORM,
      reactionSmarts: ['[N:1]>>[N:1]'],
      useStereochemistry: true,
    };
    expect(formFromParams(paramsFromForm(form))).toEqual(form);
  });

  it('writes a range only when it is narrower than 0 to 100', () => {
    const params = paramsFromForm({ ...EMPTY_FORM, yieldRange: [50, 100] });
    expect(params.get('min_yield')).toBe('50');
    expect(params.get('max_yield')).toBe('100');
    expect(params.has('min_conversion')).toBe(false);
  });

  it('round-trips a full form', () => {
    const form: SearchForm = {
      structures: [
        { pattern: 'c1ccccc1', target: 'output', mode: 'substructure' },
        { pattern: '[C;R]Cl', target: 'input', mode: 'smarts' },
      ],
      useStereochemistry: true,
      similarity: 0.6,
      reactionSmarts: ['[N:1]>>[N:1]'],
      yieldRange: [10, 90],
      conversionRange: [0, 50],
      datasetIds: ['ord_dataset-1'],
      dois: ['10.1/x'],
      reactionIds: ['ord-1', 'ord-2'],
      limit: 300,
    };
    expect(formFromParams(paramsFromForm(form))).toEqual(form);
  });
});

describe('searchPath', () => {
  it('carries the parameters in the fragment', () => {
    const params = paramsFromForm({
      ...EMPTY_FORM,
      structures: [{ pattern: 'C(=O)Cl', target: 'input', mode: 'exact' }],
    }).toString();
    expect(searchPath(params)).toBe(`/search#${params}`);
    expect(new URL(searchPath(params), 'https://viewer.example').search).toBe('');
  });

  it('is the bare page for no parameters', () => {
    expect(searchPath('')).toBe('/search');
  });
});
