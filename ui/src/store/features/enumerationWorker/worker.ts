/*
 * Copyright 2024 Open Reaction Database Project Authors
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
import type {
  EnumerationBatchRequest,
  EnumerationBatchResult,
  EnumerationError,
  TemplateCSVRow,
  VariableMatch,
} from 'store/entities/enumeration/enumeration.types.ts';
import type { AppReaction } from 'store/entities/reactions/reactions.types.ts';
import { type Variable, VariableType } from 'store/entities/templates/templates.types.ts';
import {
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
} from 'store/entities/reactions/reactions.utils.ts';
import { Buffer } from 'buffer';
import { ord } from 'ord-schema-protobufjs';
import { reactionToOrdReaction } from 'store/entities/reactions/reactions.converters.ts';
import { ordBooleanToReaction } from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { DATE_FORMAT, DATE_TIME_FORMAT } from 'common/constants.ts';

// customParseFormat gives dayjs strict parsing against an explicit format list. Without it dayjs
// falls back to the lenient native Date parser, which silently coerces garbage like "Aprillllll,
// 2025" into April 1 — see issue #544. Strict mode rejects anything that doesn't match a format.
dayjs.extend(customParseFormat);

// ISO-8601-shaped input (the app's own output plus tz-aware inputs): a YYYY-MM-DD date with an
// optional time and an optional Z/±HHMM offset. The 'Z'/offset token isn't honored by
// customParseFormat's strict mode, so ISO is gated by this (deliberately simple) regex and parsed
// with dayjs's default ISO parser; non-ISO human formats go through the strict list below.
const ISO_8601 = /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d\d:?\d\d)?)?$/;

// Non-ISO date formats accepted for enumeration CSV cells: common human-authored formats (US slash,
// European dot, and named-month). Extend this list if a legitimate CSV format is rejected.
const ACCEPTED_DATE_FORMATS = [
  'YYYY/MM/DD',
  'MM/DD/YYYY',
  'M/D/YYYY',
  'DD.MM.YYYY',
  'D.M.YYYY',
  'MMMM D, YYYY',
  'MMMM D YYYY',
  'MMM D, YYYY',
  'MMM D YYYY',
  'D MMMM YYYY',
  'D MMM YYYY',
];

const produceValueTypeError = (type: string, variable: Variable) =>
  new Error(`Expected ${type} value for variable ${variable.name}`);

type ValueType = string | number | boolean;

// dayjs's ISO parser silently rolls out-of-range month/day (e.g. 2025-13-45 → 2026-02-14), so bound
// them numerically. Kept in code rather than the regex to keep the pattern's complexity low.
function isInRangeIsoDate(value: string): boolean {
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function getDateOrError(value: ValueType, variable: Variable): string {
  if (typeof value !== 'string') {
    throw produceValueTypeError('date', variable);
  }
  const isIso = ISO_8601.test(value);
  if (isIso && !isInRangeIsoDate(value)) {
    throw produceValueTypeError('date', variable);
  }
  const date = isIso ? dayjs(value) : dayjs(value, ACCEPTED_DATE_FORMATS, true);
  if (!date.isValid()) {
    throw produceValueTypeError('date', variable);
  }
  return variable.type === VariableType.Date ? date.format(DATE_FORMAT) : date.format(DATE_TIME_FORMAT);
}

function getSelectOrError(value: ValueType, variable: Variable): string {
  if (typeof value === 'boolean') {
    return ordBooleanToReaction(value);
  }

  if (typeof value !== 'string') {
    throw produceValueTypeError('string option', variable);
  }
  // All select options should be upper cases
  return value.toUpperCase();
}

function getNumberArrayOrError(value: ValueType, variable: Variable): Array<number> {
  if (typeof value === 'number') {
    return [value];
  }
  if (typeof value !== 'string') {
    throw produceValueTypeError('number array', variable);
  }
  const values = value.split(',').map(item => Number.parseFloat(item));
  if (values.some(item => Number.isNaN(item))) {
    throw produceValueTypeError('number array', variable);
  }
  return values;
}

function getVariableValueOrError(variable: Variable, value: ValueType): string | number | Array<number> {
  switch (variable.type) {
    case VariableType.String: {
      if (typeof value !== 'string') {
        return value.toString();
      }
      return value;
    }
    case VariableType.Number: {
      if (typeof value !== 'number') {
        throw produceValueTypeError('number', variable);
      }
      return value;
    }
    case VariableType.Select:
      return getSelectOrError(value, variable);
    case VariableType.DateTime:
    case VariableType.Date: {
      return getDateOrError(value, variable);
    }
    case VariableType.NumberArray: {
      return getNumberArrayOrError(value, variable);
    }
  }
}

function enumerateReaction(
  template: AppReaction,
  variables: Array<Variable>,
  matching: Array<VariableMatch>,
  templateCSVRow: TemplateCSVRow,
): string {
  let updatedTemplate = structuredClone(template);
  variables.forEach((variable: Variable) => {
    const { name, path } = variable;
    const columnName = matching.find(item => item.variable === name)!.csvColumn as string;
    const value = getVariableValueOrError(variable, templateCSVRow[columnName]);

    updatedTemplate = deepMergeWithArrayMerge(updatedTemplate, generateDeepPartialReactionByPath(path, value));
  });
  const ordReaction = reactionToOrdReaction(updatedTemplate);
  return Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
}

onmessage = event => {
  if (typeof event.data !== 'object') {
    return;
  }
  const { data, variables, templateCSV, matching, index: baseIndex } = event.data as EnumerationBatchRequest;
  const template = structuredClone(data);
  template.reactionId = null;
  const templateCSVRows = templateCSV.content;
  let reactions: Array<string> = [];
  let errors: Array<EnumerationError> = [];

  for (let index = 0; index < templateCSVRows.length; index++) {
    try {
      reactions = reactions.concat(enumerateReaction(template, variables, matching, templateCSVRows[index]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: Error | any) {
      errors = errors.concat({
        line: baseIndex + index + 2,
        message: e.message,
      });
    }
  }
  const result: EnumerationBatchResult = {
    reactions,
    errors,
  };
  postMessage(result);
};
