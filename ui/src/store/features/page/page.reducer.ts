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
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PageState {
  status: 'idle' | 'loading' | 'error' | 'notFound';
  errorCode: number | null;
  errorMessage: string | null;
}

const initialState: PageState = {
  status: 'idle',
  errorCode: null,
  errorMessage: null,
};

const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setPageStatus: (
      state,
      action: PayloadAction<{ status: PageState['status']; errorCode?: number; errorMessage?: string }>,
    ) => {
      state.status = action.payload.status;
      state.errorCode = action.payload.errorCode ?? null;
      state.errorMessage = action.payload.errorMessage ?? null;
    },
  },
});

export const { setPageStatus } = pageSlice.actions;
export default pageSlice.reducer;
