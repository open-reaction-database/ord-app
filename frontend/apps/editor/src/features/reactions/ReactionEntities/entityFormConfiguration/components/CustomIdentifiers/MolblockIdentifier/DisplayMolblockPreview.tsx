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
import { memo, useEffect, useState } from 'react';
import { renderPreviews } from '@open-reaction-database/ui/reaction/previews';
import classes from './molblockIdentifier.module.scss';
import { Flex } from '@mantine/core';
import type { ReactionCompoundIdentifier } from '@open-reaction-database/ui/reaction/model';

interface DisplayMolblockPreviewProps {
  identifier: ReactionCompoundIdentifier;
}

export const DisplayMolblockPreview = memo(function DisplayMolblockPreview({
  identifier,
}: Readonly<DisplayMolblockPreviewProps>) {
  const { value: molblock, details, type } = identifier;
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    setSvg(null);
    if (!molblock) {
      return;
    }
    // A newer molblock supersedes a render still in flight.
    let isCurrent = true;
    void renderPreviews({ molblock }, { size: 80 }).then(
      svgsById => {
        if (isCurrent) {
          setSvg(svgsById.molblock ?? null);
        }
      },
      // A molblock that cannot be rendered shows no preview.
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, [molblock]);

  return svg ? (
    <Flex
      className={classes.previewWrapper}
      justify="center"
    >
      <img
        className={classes.preview}
        alt={details ?? type}
        src={`data:image/svg+xml;base64,${svg}`}
      />
    </Flex>
  ) : null;
});
