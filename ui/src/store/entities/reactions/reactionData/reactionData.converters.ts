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
import { ord } from 'ord-schema-protobufjs';
import { AppDataType, type AppData } from './reactionData.types.ts';
import { Buffer } from 'buffer';
import { withIdName } from 'store/entities/reactions/reactionEntity/reactionEntity.converters.ts';

export function ordDataToReactionData({ description, format, ...data }: ord.IData, name: string): AppData {
  let type: AppData['data']['type'];
  let value: AppData['data']['value'];

  if (data.url) {
    type = AppDataType.Url;
    value = data.url;
  } else if (data.stringValue) {
    type = AppDataType.Text;
    value = data.stringValue;
  } else if (data.bytesValue) {
    type = AppDataType.Upload;
    value = Buffer.from(data.bytesValue).toString('base64');
  } else {
    type = AppDataType.Number;
    value = data.floatValue ?? data.integerValue ?? null;
  }

  return withIdName(
    {
      data: {
        value,
        type,
        format,
      },
      description,
    },
    name,
  );
}

export function reactionDataToOrdData({ description, data }: AppData): ord.IData {
  const emptyData = ord.Data.toObject(new ord.Data({ description, format: data.format }));
  if (data.value === null) {
    // Nothing to add here
  } else if (data.type === AppDataType.Url) {
    emptyData.url = data.value;
  } else if (data.type === AppDataType.Text) {
    emptyData.stringValue = data.value;
  } else if (data.type === AppDataType.Upload) {
    emptyData.bytesValue = Uint8Array.from(Buffer.from(data.value as string, 'base64'));
  } else if (Number.isInteger(data.value)) {
    emptyData.integerValue = data.value;
  } else {
    emptyData.floatValue = data.value;
  }

  return emptyData;
}

export function ordDataMapToReactionDataMap(ordDataMap: Record<string, ord.IData>): Record<string, AppData> {
  return Object.entries(ordDataMap).reduce((acc, [name, ordData]) => {
    const reactionData = ordDataToReactionData(ordData, name);
    return {
      ...acc,
      [reactionData.id]: reactionData,
    };
  }, {});
}

export function reactionDataMapToOrdDataMap(reactionDataMap: Record<string, AppData>): Record<string, ord.IData> {
  return Object.values(reactionDataMap).reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: reactionDataToOrdData(item),
    }),
    {},
  );
}
