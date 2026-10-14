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
import type { Query } from '#api/types.ts';
import {
  isFullRange,
  type NumberRange,
  type SearchForm,
  type StructureField,
} from '#search/form.ts';

/** One predicate of the grammar. */
type Predicate = NonNullable<Query['where']>;

const STRUCTURE_PATHS = { input: 'inputs.components', output: 'outcomes.products' };

function structurePredicate(
  { pattern, mode }: StructureField,
  form: SearchForm,
): Predicate {
  switch (mode) {
    case 'exact':
      return { op: 'same_compound', path: 'smiles', smiles: pattern };
    case 'similar':
      return {
        op: 'similarity',
        path: 'smiles',
        smiles: pattern,
        threshold: form.similarity,
      };
    // A substructure's SMILES is read as SMARTS, as the cartridge's SMILES query read it
    // for most patterns.
    case 'substructure':
    case 'smarts':
      return {
        op: 'substructure',
        path: 'smiles',
        smarts: pattern,
        chirality: form.useStereochemistry,
      };
  }
}

function between(path: string, [low, high]: NumberRange): Array<Predicate> {
  return [
    { op: 'ge', path, value: { literal: low } },
    { op: 'le', path, value: { literal: high } },
  ];
}

/** The values trimmed, without the blank ones. */
function filled(values: ReadonlyArray<string>): Array<string> {
  return values.map(value => value.trim()).filter(value => value !== '');
}

function anyOf(path: string, values: ReadonlyArray<string>): Array<Predicate> {
  const kept = filled(values);
  return kept.length === 0
    ? []
    : [
        {
          op: 'or',
          clauses: kept.map(value => ({
            op: 'eq' as const,
            path,
            value: { literal: value },
          })),
        },
      ];
}

/**
 * The form as a query: each field set adds a clause, and the clauses are joined by and.
 *
 * Returns null when nothing is set. Matches come back ordered by reaction ID, at most
 * the form's limit.
 */
export function compileQuery(form: SearchForm): Query | null {
  const clauses: Array<Predicate> = [];
  for (const structure of form.structures) {
    if (structure.pattern.trim() !== '') {
      clauses.push({
        op: 'exists',
        path: STRUCTURE_PATHS[structure.target],
        where: structurePredicate(
          { ...structure, pattern: structure.pattern.trim() },
          form,
        ),
      });
    }
  }
  for (const smarts of filled(form.reactionSmarts)) {
    clauses.push({ op: 'reaction_smarts', smarts, chirality: form.useStereochemistry });
  }
  if (!isFullRange(form.yieldRange)) {
    clauses.push({
      op: 'exists',
      path: 'outcomes.products',
      where: {
        op: 'exists',
        path: 'measurements',
        where: {
          op: 'and',
          clauses: [
            { op: 'eq', path: 'type', value: { literal: 'YIELD' } },
            ...between('percentage.value', form.yieldRange),
          ],
        },
      },
    });
  }
  if (!isFullRange(form.conversionRange)) {
    clauses.push({
      op: 'exists',
      path: 'outcomes',
      where: { op: 'and', clauses: between('conversion.value', form.conversionRange) },
    });
  }
  clauses.push(
    ...anyOf('dataset_id', form.datasetIds),
    ...anyOf('provenance.doi', form.dois),
    ...anyOf('reaction_id', form.reactionIds),
  );
  if (clauses.length === 0) {
    return null;
  }
  return {
    where: clauses.length === 1 ? clauses[0] : { op: 'and', clauses },
    order_by: [{ key: 'reaction_id' }],
    limit: form.limit,
  };
}
