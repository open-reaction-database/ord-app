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
import type { PropsWithChildren } from 'react';

/** What a drawing is saved as: a molfile, SMILES, CXSMILES, or SMARTS. */
export type StructureFormat = 'molfile' | 'smiles' | 'cxsmiles' | 'smarts';

/** `children` are fields shown beside the buttons, such as the editor's Details. */
export interface StructureDialogProps extends PropsWithChildren {
  opened: boolean;
  onClose: () => void;
  /** The structure the canvas opens with, in any notation Ketcher reads; '' for none. */
  initial: string;
  /** The notation onSave receives the drawing in. */
  format: StructureFormat;
  /**
   * Receives the drawing when Save is clicked, after which the dialog closes. A drawing
   * Ketcher cannot write in `format`, or one that would lose what Ketcher could not read
   * from `initial`, is reported in a notification instead, and the dialog stays open.
   */
  onSave: (structure: string) => void;
}
