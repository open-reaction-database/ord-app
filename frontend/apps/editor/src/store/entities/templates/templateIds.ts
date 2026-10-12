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
// The editor stores a template under `template_<number>`, where the backend's number is what its
// API and the template page's route use.

/** The stored id of the template the backend numbers `number`. */
export const templateIdFromNumber = (number: number | string): string =>
  `template_${number}`;

/** The backend's number for a stored template id. */
export const templateNumberFromId = (templateId: string): number =>
  Number.parseInt(templateId.split('_')[1]);
