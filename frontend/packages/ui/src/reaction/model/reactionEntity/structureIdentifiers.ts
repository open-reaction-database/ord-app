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
import type { CompoundIdentifierType } from '#reaction/model/reactionEntityTypes/reactionEntityTypes.types.ts';

/**
 * The identifier types a molecule editor draws.
 *
 * Each loads onto the editor's canvas and serializes back to its own type, so the view
 * shows them as structure previews rather than as text fields.
 */
export const STRUCTURE_IDENTIFIER_TYPES = [
  'MOLBLOCK',
  'CXSMILES',
] as const satisfies ReadonlyArray<CompoundIdentifierType>;

export type StructureIdentifierType = (typeof STRUCTURE_IDENTIFIER_TYPES)[number];

/** The type a structure drawn from scratch is saved as. */
export const DEFAULT_STRUCTURE_IDENTIFIER_TYPE: StructureIdentifierType = 'MOLBLOCK';

export function isStructureIdentifierType(
  type: string,
): type is StructureIdentifierType {
  return (STRUCTURE_IDENTIFIER_TYPES as ReadonlyArray<string>).includes(type);
}
