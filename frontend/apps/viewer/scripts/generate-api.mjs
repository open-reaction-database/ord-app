/*
 * Copyright 2026 Open Reaction Database Project Authors
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

// Writes src/api/schema.ts from the viewer backend's committed OpenAPI document.
//
// The license header the committed file starts with is kept: addlicense writes it once,
// with the year the file was first committed, and regenerating must not change it.
import { readFile, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

const DOCUMENT = new URL('../../../../backend/viewer/openapi.json', import.meta.url);
const OUTPUT = new URL('../src/api/schema.ts', import.meta.url);
// A leading block comment naming a copyright, as addlicense writes it, and the blank line
// after it if there is one.
const LICENSE_HEADER = /^\/\*\*?\n \* Copyright [\s\S]*?\n \*\/\n\n?/;

async function licenseHeader() {
  try {
    return (await readFile(OUTPUT, 'utf8')).match(LICENSE_HEADER)?.[0] ?? '';
  } catch (error) {
    if (error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

const header = await licenseHeader();
const generated = astToString(await openapiTS(DOCUMENT));
await writeFile(OUTPUT, header + generated);
