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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  EnumerationBatchRequest,
  EnumerationBatchResult,
  TemplateCSVRow,
  VariableMatch,
} from 'store/entities/enumeration/enumeration.types.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import { type Variable, VariableType } from 'store/entities/templates/templates.types.ts';

// reactionToOrdReaction (and the protobuf encode it feeds) is the heavy tail of
// enumerateReaction; mocking it lets us capture the *coerced & merged* template
// without standing up a full, encodable reaction. ordBooleanToReaction and the
// reactions.utils merge helpers are left real so the coercion logic is exercised.
const { reactionToOrdReactionMock } = vi.hoisted(() => ({
  reactionToOrdReactionMock: vi.fn((_template: unknown) => ({})),
}));
vi.mock('store/entities/reactions/reactions.converters.ts', () => ({
  reactionToOrdReaction: reactionToOrdReactionMock,
}));

// Importing the module assigns the global onmessage handler as a side effect.
import './worker.ts';

const handler = globalThis.onmessage as unknown as (event: { data: unknown }) => void;

function makeVariable(type: VariableType, overrides: Partial<Variable> = {}): Variable {
  return { name: 'v1', field: 'f1', type, path: ['valueField'], ...overrides };
}

interface RunOptions {
  variables?: Array<Variable>;
  matching?: Array<VariableMatch>;
  rows?: Array<TemplateCSVRow>;
  index?: number;
}

/** Drive the worker's onmessage handler for one batch and return its posted result. */
function run({
  variables = [makeVariable(VariableType.String)],
  matching = [{ variable: 'v1', csvColumn: 'col1' }],
  rows = [{ col1: 'value' }],
  index = 0,
}: RunOptions = {}): EnumerationBatchResult {
  const request: EnumerationBatchRequest = {
    data: {} as unknown as AppReaction,
    variables,
    matching: matching as Array<Required<VariableMatch>>,
    templateCSV: { headers: ['col1'], content: rows },
    index,
  };
  handler({ data: request });
  return postMessageMock.mock.calls.at(-1)?.[0] as EnumerationBatchResult;
}

/** The merged template handed to reactionToOrdReaction for the most recent reaction. */
function lastMergedTemplate(): Record<string, unknown> {
  return reactionToOrdReactionMock.mock.calls.at(-1)?.[0] as unknown as Record<string, unknown>;
}

let postMessageMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  postMessageMock = vi.fn();
  vi.stubGlobal('postMessage', postMessageMock);
  reactionToOrdReactionMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('enumeration worker onmessage', () => {
  it('ignores a message whose data is not an object', () => {
    handler({ data: 'not-an-object' });
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('clears the template reactionId and coerces a value onto the variable path', () => {
    const result = run({
      variables: [makeVariable(VariableType.String, { path: ['valueField'] })],
      rows: [{ col1: 'abc' }],
    });
    expect(result.errors).toEqual([]);
    expect(result.reactions).toHaveLength(1);
    const merged = lastMergedTemplate();
    expect(merged.reactionId).toBeNull();
    expect(merged.valueField).toBe('abc');
  });

  it('reports one error per failing row, leaving successful rows intact', () => {
    const result = run({
      variables: [makeVariable(VariableType.Number)],
      rows: [{ col1: 5 }, { col1: 'oops' }],
      index: 10,
    });
    expect(result.reactions).toHaveLength(1);
    // baseIndex (10) + row index (1) + 2 (1-based + header row) = 13.
    expect(result.errors).toEqual([{ line: 13, message: 'Expected number value for variable v1' }]);
  });
});

describe('value coercion by VariableType', () => {
  it('stringifies a non-string value for a String variable', () => {
    run({ variables: [makeVariable(VariableType.String)], rows: [{ col1: 42 }] });
    expect(lastMergedTemplate().valueField).toBe('42');
  });

  it('passes a number through for a Number variable', () => {
    run({ variables: [makeVariable(VariableType.Number)], rows: [{ col1: 7 }] });
    expect(lastMergedTemplate().valueField).toBe(7);
  });

  it('throws for a Number variable given a non-number', () => {
    const result = run({ variables: [makeVariable(VariableType.Number)], rows: [{ col1: 'x' }] });
    expect(result.reactions).toEqual([]);
    expect(result.errors[0].message).toBe('Expected number value for variable v1');
  });

  it('upper-cases a string option for a Select variable', () => {
    run({ variables: [makeVariable(VariableType.Select)], rows: [{ col1: 'aqueous' }] });
    expect(lastMergedTemplate().valueField).toBe('AQUEOUS');
  });

  it('maps a boolean to the ORD boolean enum for a Select variable', () => {
    run({ variables: [makeVariable(VariableType.Select)], rows: [{ col1: true }] });
    expect(lastMergedTemplate().valueField).toBe('True');
  });

  it('rejects a numeric Select value', () => {
    const result = run({ variables: [makeVariable(VariableType.Select)], rows: [{ col1: 3 }] });
    expect(result.errors[0].message).toBe('Expected string option value for variable v1');
  });

  it('formats a Date variable to YYYY-MM-DD', () => {
    run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: '2024-01-15T08:30:00' }] });
    expect(lastMergedTemplate().valueField).toBe('2024-01-15');
  });

  it('formats a DateTime variable with the time component', () => {
    run({ variables: [makeVariable(VariableType.DateTime)], rows: [{ col1: '2024-01-15T08:30:00' }] });
    expect(lastMergedTemplate().valueField).toBe('2024-01-15T08:30:00');
  });

  it('accepts a plain ISO date, single-digit European, and common human-authored formats', () => {
    for (const input of [
      '2025-04-01',
      '04/01/2025',
      '4/1/2025',
      '1.4.2025',
      '01.04.2025',
      'April 1, 2025',
      'Apr 1 2025',
    ]) {
      const result = run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: input }] });
      expect(result.errors).toEqual([]);
      expect(lastMergedTemplate().valueField).toBe('2025-04-01');
    }
  });

  it('accepts timezone-offset ISO 8601 datetimes for a Date variable', () => {
    // Valid ISO with a Z/offset/milliseconds was previously accepted by lenient dayjs; it must still be.
    for (const input of ['2025-04-01T12:00:00Z', '2025-04-01T12:00:00+05:30', '2025-04-01T00:30:00.123Z']) {
      const result = run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: input }] });
      expect(result.errors).toEqual([]);
      expect(lastMergedTemplate().valueField).toMatch(/^2025-(03-31|04-01)$/);
    }
  });

  it('rejects an invalid date', () => {
    const result = run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: 'not-a-date' }] });
    expect(result.errors[0].message).toBe('Expected date value for variable v1');
  });

  it('rejects a garbage date that the lenient parser would silently coerce (#544)', () => {
    // dayjs(value) without strict mode parses these as April 1 / month-overflow; we must not. The
    // ISO-shaped values have out-of-range month/day, which the ISO regex bounds reject.
    for (const input of ['Aprillllll, 2025', 'MayMayMay, 2025', '2025-13-45', '2025-00-10', '2025-04-32']) {
      const result = run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: input }] });
      expect(result.reactions).toEqual([]);
      expect(result.errors[0].message).toBe('Expected date value for variable v1');
    }
  });

  it('rejects a non-string date value', () => {
    const result = run({ variables: [makeVariable(VariableType.Date)], rows: [{ col1: 123 }] });
    expect(result.errors[0].message).toBe('Expected date value for variable v1');
  });

  it('wraps a single number in an array for a NumberArray variable', () => {
    run({ variables: [makeVariable(VariableType.NumberArray)], rows: [{ col1: 9 }] });
    expect(lastMergedTemplate().valueField).toEqual([9]);
  });

  it('splits a comma-separated string for a NumberArray variable', () => {
    run({ variables: [makeVariable(VariableType.NumberArray)], rows: [{ col1: '1.5,2,3' }] });
    expect(lastMergedTemplate().valueField).toEqual([1.5, 2, 3]);
  });

  it('rejects a NumberArray string with a non-numeric entry', () => {
    const result = run({ variables: [makeVariable(VariableType.NumberArray)], rows: [{ col1: '1,x,3' }] });
    expect(result.errors[0].message).toBe('Expected number array value for variable v1');
  });

  it('rejects a non-string, non-number NumberArray value', () => {
    const result = run({ variables: [makeVariable(VariableType.NumberArray)], rows: [{ col1: true }] });
    expect(result.errors[0].message).toBe('Expected number array value for variable v1');
  });
});
