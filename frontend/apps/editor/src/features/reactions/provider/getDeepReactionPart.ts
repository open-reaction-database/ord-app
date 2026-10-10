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
/* eslint-disable @typescript-eslint/no-explicit-any -- a path can reach a part of any type */
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

/**
 * Returns the part of `reaction` at `pathComponents`: undefined when only the last step is
 * missing, and null when the path breaks before it.
 */
export function getDeepReactionPart(
  reaction: any,
  pathComponents: ReactionPathComponents,
): any {
  try {
    // Stepping into a missing part throws.
    return pathComponents.reduce((reactionPart: any, key) => {
      return reactionPart[key];
    }, reaction);
  } catch (_e) {
    return null;
  }
}
