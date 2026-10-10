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
import { create, type MessageInitShape } from '@bufbuild/protobuf';
import {
  DataSchema,
  type Data,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { AppDataType, type AppData } from './reactionData.types.ts';
import { Buffer } from 'buffer';
import {
  ordScalarToReaction,
  withIdName,
} from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';
import type { OrdOptional } from '../reactionEntity/reactionEntity.types.ts';

const INT32_MIN = -(2 ** 31);
const INT32_MAX = 2 ** 31 - 1;

const emptyNumberValue: Pick<AppData['data'], 'type' | 'value'> = {
  type: AppDataType.Number,
  value: null,
};

function ordDataValueToReaction(
  kind: Data['kind'],
): Pick<AppData['data'], 'type' | 'value'> {
  switch (kind.case) {
    case 'url':
      return kind.value
        ? { type: AppDataType.Url, value: kind.value }
        : emptyNumberValue;
    case 'stringValue':
      return kind.value
        ? { type: AppDataType.Text, value: kind.value }
        : emptyNumberValue;
    case 'bytesValue':
      return {
        type: AppDataType.Upload,
        value: Buffer.from(kind.value).toString('base64'),
      };
    case 'floatValue':
    case 'integerValue':
      return { type: AppDataType.Number, value: kind.value };
    default:
      return emptyNumberValue;
  }
}

export function ordDataToReaction(
  dataWrapper: OrdOptional<Data>,
  name: string,
): AppData {
  const { kind, format, description } = dataWrapper ?? create(DataSchema);
  return withIdName(
    {
      data: {
        ...ordDataValueToReaction(kind),
        format: ordScalarToReaction(format),
      },
      description: ordScalarToReaction(description),
    },
    name,
  );
}

function reactionDataValueToOrd({
  type,
  value,
}: AppData['data']): MessageInitShape<typeof DataSchema>['kind'] {
  if (value === null) {
    return undefined;
  }
  if (type === AppDataType.Url) {
    return { case: 'url', value: String(value) };
  }
  if (type === AppDataType.Text) {
    return { case: 'stringValue', value: String(value) };
  }
  if (type === AppDataType.Upload) {
    return {
      case: 'bytesValue',
      value: Uint8Array.from(Buffer.from(String(value), 'base64')),
    };
  }
  const number = Number(value);
  // integer_value is an int32, and encoding one out of range throws.
  if (Number.isInteger(value) && number >= INT32_MIN && number <= INT32_MAX) {
    return { case: 'integerValue', value: number };
  }
  return { case: 'floatValue', value: number };
}

export function reactionDataToOrd({
  description,
  data,
}: AppData): MessageInitShape<typeof DataSchema> {
  return {
    description: description ?? undefined,
    format: data.format ?? undefined,
    kind: reactionDataValueToOrd(data),
  };
}

export function ordDataMapToReactionDataMap(
  ordDataMap: Record<string, Data>,
): Record<string, AppData> {
  return Object.entries(ordDataMap).reduce((acc, [name, ordData]) => {
    const reactionData = ordDataToReaction(ordData, name);
    return {
      ...acc,
      [reactionData.id]: reactionData,
    };
  }, {});
}

export function reactionDataMapToOrdDataMap(
  reactionDataMap: Record<string, AppData>,
): Record<string, MessageInitShape<typeof DataSchema>> | undefined {
  const values = Object.values(reactionDataMap);
  return values.length > 0
    ? values.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: reactionDataToOrd(item),
        }),
        {},
      )
    : undefined;
}
