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
/** Which side of a reaction a structure is looked for on. */
export type StructureTarget = 'input' | 'output';

/** How a structure matches: as the same compound, by similarity, or as a pattern. */
export type MatchMode = 'exact' | 'similar' | 'substructure' | 'smarts';

export interface StructureField {
  /** A SMILES, or a SMARTS in the smarts mode. */
  pattern: string;
  target: StructureTarget;
  mode: MatchMode;
}

/** Inclusive bounds, in percent. */
export type NumberRange = [number, number];

/** The search form, as the URL holds it under ord-interface's parameter names. */
export interface SearchForm {
  structures: Array<StructureField>;
  useStereochemistry: boolean;
  /** The Tanimoto threshold for similar structures, in (0, 1]. */
  similarity: number;
  reactionSmarts: Array<string>;
  yieldRange: NumberRange;
  conversionRange: NumberRange;
  datasetIds: Array<string>;
  dois: Array<string>;
  reactionIds: Array<string>;
  /** The most reactions to return, from 1 to MAX_LIMIT. */
  limit: number;
}

export const DEFAULT_SIMILARITY = 0.5;
export const DEFAULT_LIMIT = 100;
/** The backend's bound on a result's rows. */
export const MAX_LIMIT = 1000;
export const FULL_RANGE: NumberRange = [0, 100];

export const EMPTY_FORM: SearchForm = {
  structures: [],
  useStereochemistry: false,
  similarity: DEFAULT_SIMILARITY,
  reactionSmarts: [],
  yieldRange: FULL_RANGE,
  conversionRange: FULL_RANGE,
  datasetIds: [],
  dois: [],
  reactionIds: [],
  limit: DEFAULT_LIMIT,
};

const TARGETS: ReadonlyArray<StructureTarget> = ['input', 'output'];
const MODES: ReadonlyArray<MatchMode> = ['exact', 'similar', 'substructure', 'smarts'];

/** The structure named, or null for a target or mode ord-interface would not accept. */
function structureOf(
  pattern: unknown,
  target: unknown,
  mode: unknown,
): StructureField | null {
  if (
    typeof pattern !== 'string' ||
    typeof target !== 'string' ||
    typeof mode !== 'string'
  ) {
    return null;
  }
  const knownTarget = TARGETS.find(value => value === target.toLowerCase());
  const knownMode = MODES.find(value => value === mode.toLowerCase());
  return knownTarget && knownMode
    ? { pattern, target: knownTarget, mode: knownMode }
    : null;
}

/**
 * One component value: a JSON object, or ord-interface's legacy "pattern;target;mode",
 * split from the right since a SMARTS may hold ";".
 */
function parseComponent(value: string): StructureField | null {
  const trimmed = value.trim();
  if (trimmed.startsWith('{')) {
    try {
      const { pattern, target, mode } = JSON.parse(trimmed) as Record<string, unknown>;
      return structureOf(pattern, target, mode);
    } catch {
      return null;
    }
  }
  const parts = trimmed.split(';');
  if (parts.length < 3) {
    return null;
  }
  const mode = parts.pop();
  const target = parts.pop();
  return structureOf(parts.join(';'), target, mode);
}

function percent(value: string | null, fallback: number): number {
  const number = value === null || value.trim() === '' ? Number.NaN : Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : fallback;
}

function rangeOf(params: URLSearchParams, low: string, high: string): NumberRange {
  return [percent(params.get(low), 0), percent(params.get(high), 100)];
}

function similarityOf(value: string | null): number {
  const number = value === null ? Number.NaN : Number(value);
  return number > 0 && number <= 1 ? number : DEFAULT_SIMILARITY;
}

function limitOf(value: string | null): number {
  const number = value === null ? Number.NaN : Math.floor(Number(value));
  return number >= 1 ? Math.min(number, MAX_LIMIT) : DEFAULT_LIMIT;
}

/** The form a URL's parameters describe; a value it cannot read keeps its default. */
export function formFromParams(params: URLSearchParams): SearchForm {
  return {
    structures: params
      .getAll('component')
      .map(parseComponent)
      .filter((structure): structure is StructureField => structure !== null),
    useStereochemistry: params.get('use_stereochemistry') === 'true',
    similarity: similarityOf(params.get('similarity')),
    reactionSmarts: params.getAll('reaction_smarts'),
    yieldRange: rangeOf(params, 'min_yield', 'max_yield'),
    conversionRange: rangeOf(params, 'min_conversion', 'max_conversion'),
    datasetIds: params.getAll('dataset_id'),
    dois: params.getAll('doi'),
    reactionIds: params.getAll('reaction_id'),
    limit: limitOf(params.get('limit')),
  };
}

function isFullRange([low, high]: NumberRange): boolean {
  return low === FULL_RANGE[0] && high === FULL_RANGE[1];
}

/** The URL's parameters for a form, as ord-interface's search page wrote them. */
export function paramsFromForm(form: SearchForm): URLSearchParams {
  const params = new URLSearchParams();
  for (const { pattern, target, mode } of form.structures) {
    params.append('component', JSON.stringify({ pattern, target, mode }));
  }
  if (form.structures.length > 0) {
    params.set('use_stereochemistry', String(form.useStereochemistry));
    params.set('similarity', String(form.similarity));
  }
  for (const smarts of form.reactionSmarts) {
    params.append('reaction_smarts', smarts);
  }
  if (!isFullRange(form.yieldRange)) {
    params.set('min_yield', String(form.yieldRange[0]));
    params.set('max_yield', String(form.yieldRange[1]));
  }
  if (!isFullRange(form.conversionRange)) {
    params.set('min_conversion', String(form.conversionRange[0]));
    params.set('max_conversion', String(form.conversionRange[1]));
  }
  for (const datasetId of form.datasetIds) {
    params.append('dataset_id', datasetId);
  }
  for (const doi of form.dois) {
    params.append('doi', doi);
  }
  for (const reactionId of form.reactionIds) {
    params.append('reaction_id', reactionId);
  }
  params.set('limit', String(form.limit));
  return params;
}
