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
import * as htmlToImage from 'html-to-image';
import {
  NotificationVariant,
  type AppNotification,
} from 'common/types/notification.ts';
import {
  ReactionMeasurementValueType,
  type ReactionProduct,
} from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';

// The protobuf ProductMeasurementType key for a yield measurement.
const YIELD_MEASUREMENT_TYPE = 'YIELD';

/**
 * The product's yield as a percent number, or undefined when there's no usable YIELD measurement.
 * Used to surface the yield % in the outcome/product preview. (#598)
 */
export function getProductYieldPercent(product: ReactionProduct): number | undefined {
  const yieldValue = product.measurements?.find(
    measurement => measurement.type === YIELD_MEASUREMENT_TYPE,
  )?.value;
  if (
    yieldValue?.type === ReactionMeasurementValueType.Percent &&
    yieldValue.value.value != null
  ) {
    return yieldValue.value.value;
  }
  return undefined;
}

const errorMessage: AppNotification = {
  variant: NotificationVariant.ERROR,
  message: 'Could not copy image to clipboard.',
};

const successMessage: AppNotification = {
  variant: NotificationVariant.SUCCESS,
  message: 'Image copied to clipboard.',
};

export async function copyPreviewAsImage(node?: HTMLDivElement | null) {
  if (!node) {
    showNotification(errorMessage);
    return;
  }

  try {
    const blob = await htmlToImage.toBlob(node, {
      skipFonts: true,
      width: node.scrollWidth,
      backgroundColor: 'white',
    });

    if (blob) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showNotification(successMessage);
    } else {
      showNotification(errorMessage);
    }
  } catch (_) {
    showNotification(errorMessage);
  }
}
