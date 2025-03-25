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
  TemplateCSVRow,
  VariableMatch,
} from '../../entities/enumeration/enumeration.types.ts';
import type { AppReaction } from '../../entities/reactions/reactions.types.ts';
import type { Variable } from '../../entities/templates/templates.types.ts';
import {
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
} from '../../entities/reactions/reactions.utils.ts';
import { Buffer } from 'buffer';
import { ord } from 'ord-schema-protobufjs';
import { reactionToOrdReaction } from '../../entities/reactions/reactions.converters.ts';

function enumerateReaction(
  template: AppReaction,
  variables: Array<Variable>,
  matching: Array<VariableMatch>,
  templateCSVRow: TemplateCSVRow,
): string {
  let updatedTemplate = structuredClone(template);
  variables.forEach(({ name, path }: Variable) => {
    const columnName = matching.find(item => item.variable === name)!.csvColumn as string;
    updatedTemplate = deepMergeWithArrayMerge(
      updatedTemplate,
      generateDeepPartialReactionByPath(path, templateCSVRow[columnName]),
    );
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
  let errors: Array<number> = [];

  for (let index = 0; index < templateCSVRows.length; index++) {
    try {
      reactions = reactions.concat(enumerateReaction(template, variables, matching, templateCSVRows[index]));
    } catch (e) {
      console.info(e);
      errors = errors.concat(baseIndex + index + 2);
    }
  }
  const result: EnumerationBatchResult = {
    reactions,
    errors,
  };
  postMessage(result);
};
