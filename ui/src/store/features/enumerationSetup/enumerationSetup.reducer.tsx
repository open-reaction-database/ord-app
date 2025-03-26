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
import { combineReducers, createReducer } from '@reduxjs/toolkit';
import { setEnumerationSetupOpenedAction } from './enumerationSetup.actions.ts';
import { startEnumerationActions } from '../../entities/enumeration/enumeration.actions.ts';

const isEnumerationSetupOpened = createReducer(false, builder => {
  builder.addCase(setEnumerationSetupOpenedAction, (_, { payload }) => payload);
  builder.addCase(startEnumerationActions, () => false);
});

export const enumerationSetupReducer = combineReducers({
  isEnumerationSetupOpened,
});
