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
import { memo, useMemo } from 'react';
import { renderSvg } from 'common/utils/indigo.ts';
import classes from './molblockIdentifier.module.scss';

interface DisplayMolblockPreviewProps {
  molblock: string;
  details: string;
}

export const DisplayMolblockPreview = memo(function DisplayMolblockPreview({
  molblock,
  details,
}: Readonly<DisplayMolblockPreviewProps>) {
  const preview = useMemo(() => {
    return molblock ? `data:image/svg+xml;base64,${renderSvg(molblock)}` : null;
  }, [molblock]);

  return preview ? (
    <img
      className={classes.preview}
      alt={details}
      src={preview}
    />
  ) : null;
});
