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

const produceValueTypeError = (type: string, variable: Variable) =>
  new Error(`Expected ${type} value for variable ${variable.name}`);

type ValueType = string | number | boolean;

function getDateOrError(value: ValueType, variable: Variable): string {
  if (typeof value !== 'string') {
    throw produceValueTypeError('date', variable);
  }
  const date = dayjs(value);
  if (!date.isValid()) {
    throw produceValueTypeError('date', variable);
  }
  return value;
}

function getNumberArrayOrError(value: ValueType, variable: Variable): Array<number> {
  if (typeof value === 'number') {
    return [value];
  }
  if (typeof value !== 'string') {
    throw produceValueTypeError('number array', variable);
  }
  const values = value.split(',').map(item => parseFloat(item));
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
      if (typeof value === 'boolean') {
        return ordBooleanToReaction(value);
      }

      if (typeof value !== 'string') {
        throw produceValueTypeError('string option', variable);
      }
      return value;
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
