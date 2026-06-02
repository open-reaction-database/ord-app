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
import { useMemo } from 'react';
import type { FileControlValue } from './fileControl.types.ts';

export function useFileNameHref(name: string, value: FileControlValue | null) {
  const format = value?.format ?? '';
  const stringValue = value?.value ?? '';

  const fileName = useMemo(() => {
    // Guard against incorrect saved format files; omit the extension entirely when there is no
    // format so we don't produce a trailing-dot filename (which some platforms mishandle).
    const extension = format.replace('.', '');
    return extension ? `${name}.${extension}` : name;
  }, [format, name]);

  const href = useMemo(() => {
    return `data:application/octet-stream;base64,${stringValue}`;
  }, [stringValue]);

  return { fileName, href };
}
