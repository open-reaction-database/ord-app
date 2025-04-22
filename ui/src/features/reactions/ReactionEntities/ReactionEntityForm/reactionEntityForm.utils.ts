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
import { showNotification } from 'common/utils/showNotification.tsx';
import { NotificationVariant } from 'common/types/notification.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import {
  ordToReactionConvertersByNodeEntity,
  reactionToOrdConvertersByNodeEntity,
} from 'store/entities/reactions/reactions.models.ts';

interface ClipboardMessage {
  type: ReactionNodeEntity;
  value: object;
}

export async function copyReactionPart(entityName: ReactionNodeEntity, reactionPart: object) {
  const value = reactionToOrdConvertersByNodeEntity[entityName](reactionPart);
  const clipboardMessage = JSON.stringify(
    {
      type: entityName,
      value,
    },
    null,
    2,
  );
  try {
    await navigator.clipboard.writeText(clipboardMessage);
    showNotification({
      variant: NotificationVariant.SUCCESS,
      message: 'Copied to clipboard',
    });
  } catch (e) {
    showNotification({
      variant: NotificationVariant.ERROR,
      message: `Failed to copy to clipboard. Make sure you didn't block application's access to clipboard.`,
    });
    console.error(e);
  }
}

const inputAliases = [ReactionNodeEntity.Inputs, ReactionNodeEntity.Input];

function checkEntityNames(previousName: ReactionNodeEntity, currentName: ReactionNodeEntity): boolean {
  if (previousName === currentName) {
    return true;
  }
  // Input has two sidebars - with and without a name.
  return inputAliases.includes(previousName) && inputAliases.includes(currentName);
}

export async function pasteReactionPart(entityField: ReactionNodeEntity): Promise<[object | null, string]> {
  try {
    const text = await navigator.clipboard.readText();
    const message: ClipboardMessage = JSON.parse(text);
    if (typeof message !== 'object' || message === null) {
      throw `Invalid clipboard content.`;
    }
    if (!checkEntityNames(entityField, message.type)) {
      throw `Invalid entity name "${message.type}" expected "${entityField}".`;
    }
    const { value, type } = message;
    const converter = ordToReactionConvertersByNodeEntity[type];
    const reactionValue = converter.hasName ? converter.convert(value, '') : converter.convert(value);
    if (converter.hasName) {
      delete reactionValue.name;
    }
    return [reactionValue, text];
  } catch (e: unknown) {
    let message = `Failed to paste clipboard content.`;
    if (typeof e === 'string') {
      message = e;
    }
    showNotification({
      variant: NotificationVariant.ERROR,
      message,
    });

    return [null, ''];
  }
}
