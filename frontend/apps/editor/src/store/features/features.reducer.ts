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
import { combineReducers } from '@reduxjs/toolkit';
import { reactionFormReducer } from './reactionForm/reactionForm.reducer.ts';
import { groupsSidebar } from './groups/groups.reducer.ts';
import { reactionLookupReducer } from 'store/features/reactionLookup/reactionLookup.reducer.ts';
import { errorPageReducer } from 'store/features/errorPage/errorPage.reducer.ts';
import { enumerationSetupReducer } from './enumerationSetup/enumerationSetup.reducer.tsx';
import { variablesSidebarReducer } from './variablesSidebar/variablesSidebar.reducer.ts';
import { templateFromFileErrorReducer } from './templateFromFileError/templateFromFileError.reducer.ts';
import { reactionRenameReducer } from './reactionRename/reactionRename.reducer.ts';

export const featuresReducer = combineReducers({
  groupsSidebar: groupsSidebar,
  reactionForm: reactionFormReducer,
  reactionLookup: reactionLookupReducer,
  errorPage: errorPageReducer,
  enumerationSetup: enumerationSetupReducer,
  variablesSidebar: variablesSidebarReducer,
  templateFromFileError: templateFromFileErrorReducer,
  reactionRename: reactionRenameReducer,
});
