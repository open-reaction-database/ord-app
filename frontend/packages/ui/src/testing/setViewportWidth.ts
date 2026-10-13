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

/** happy-dom's default viewport width, above Mantine's sm breakpoint. */
export const DEFAULT_VIEWPORT_WIDTH = 1024;

/** Sets happy-dom's viewport width, which Mantine's hiddenFrom and CSS media queries answer to. */
export function setViewportWidth(width: number) {
  (
    window as unknown as {
      happyDOM: { setViewport(viewport: { width: number }): void };
    }
  ).happyDOM.setViewport({ width });
}
