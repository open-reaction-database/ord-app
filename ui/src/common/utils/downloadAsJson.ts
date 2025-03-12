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
import type { TemplateWrapper } from 'store/entities/templates/templates.types.ts';

export function downloadTemplateAsJson(object: TemplateWrapper, filename: string) {
  // Convert the object to a JSON string
  const jsonString = JSON.stringify(object, null, 2); // The `2` adds indentation for readability

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a temporary <a> element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'data.json'; // Default filename if not provided

  // Trigger the download
  link.click();

  // Clean up by revoking the object URL
  URL.revokeObjectURL(link.href);
}
