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
import type { Dispatch } from 'react';
import type { ReactionPathComponents } from 'common/types/reaction/reactionPathComponents.ts';

/** Open drawer forms, bottom first; the last one is the visible form. */
export type DrawerStack = ReadonlyArray<ReactionPathComponents>;

export type DrawerAction =
  | { type: 'set'; stack: ReadonlyArray<ReactionPathComponents> }
  | { type: 'push'; pathComponents: ReactionPathComponents }
  | { type: 'pop' }
  | { type: 'truncate'; index: number }
  | { type: 'clear' };

export interface DrawerActions {
  /** Replaces the stack, for example with the chain of entities leading to a field. */
  set(stack: ReadonlyArray<ReactionPathComponents>): void;
  push(pathComponents: ReactionPathComponents): void;
  pop(): void;
  /** Keeps the entries up to and including `index`. */
  truncate(index: number): void;
  clear(): void;
}

export const EMPTY_DRAWER_STACK: DrawerStack = [];

export function drawerReducer(stack: DrawerStack, action: DrawerAction): DrawerStack {
  switch (action.type) {
    case 'set':
      return action.stack;
    case 'push':
      return [...stack, action.pathComponents];
    case 'pop':
      return stack.slice(0, -1);
    case 'truncate':
      return stack.slice(0, action.index + 1);
    case 'clear':
      return EMPTY_DRAWER_STACK;
  }
}

/** The drawer's operations over a reducer's dispatch, which React keeps stable. */
export function createDrawerActions(dispatch: Dispatch<DrawerAction>): DrawerActions {
  return {
    set: stack => dispatch({ type: 'set', stack }),
    push: pathComponents => dispatch({ type: 'push', pathComponents }),
    pop: () => dispatch({ type: 'pop' }),
    truncate: index => dispatch({ type: 'truncate', index }),
    clear: () => dispatch({ type: 'clear' }),
  };
}
