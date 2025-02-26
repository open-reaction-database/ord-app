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
import type { PreviewState } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';
import { Loader, Title } from '@mantine/core';

interface ReactionComponentPreviewProps {
  previewState?: PreviewState;
  alt?: string;
}

export function ReactionComponentPreview({ previewState, alt }: Readonly<ReactionComponentPreviewProps>) {
  if (!previewState || previewState.isLoading) {
    return <Loader />;
  }
  const { svg } = previewState;

  return svg ? (
    <img
      alt={alt}
      src={`data:image/svg+xml;base64,${svg}`}
    />
  ) : (
    <Title order={3}>No preview</Title>
  );
}
