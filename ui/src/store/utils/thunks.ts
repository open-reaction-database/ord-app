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
import type { AnyAsyncAction, AsyncAction } from 'common/types';
import type { AppThunk, AppVoidThunk, ThunkCustomWrapper, ThunkWrapper } from 'common/types/store/thunk.ts';
import { isAxiosError } from 'axios';
import { showNotification } from '../../common/utils/showNotification.tsx';
import { NotificationVariant } from '../../common/types/notification.ts';

function processAxiosError(error: unknown): string | null {
  if (isAxiosError(error)) {
    console.info('Axios error', error);
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      showNotification({
        variant: NotificationVariant.ERROR,
        message: detail,
      });
      return detail;
    }
  }
  return null;
}

export function createThunk<AsyncAction extends AnyAsyncAction>(
  asyncActionCreator: AsyncAction,
  appThunk: AppThunk<AsyncAction>,
): ThunkWrapper<AsyncAction> {
  return extraArgument => {
    return async (dispatch, getState) => {
      dispatch(asyncActionCreator.request(extraArgument));
      try {
        const result = await appThunk(dispatch, getState, extraArgument);
        dispatch(result);
        return result;
      } catch (e) {
        const result = processAxiosError(e);
        dispatch(asyncActionCreator.failure(result));
        return;
      }
    };
  };
}

export function createThunkWithExplicitResult<AsyncAction extends AnyAsyncAction>(
  asyncActionCreator: AsyncAction,
  appThunk: AppVoidThunk<AsyncAction>,
): ThunkWrapper<AsyncAction> {
  return extraArgument => {
    return async (dispatch, getState) => {
      dispatch(asyncActionCreator.request(extraArgument));
      try {
        await appThunk(dispatch, getState, extraArgument);
      } catch (e) {
        const result = processAxiosError(e);
        dispatch(asyncActionCreator.failure(result));
        return;
      }
    };
  };
}

export function createCustomThunk(appThunk: AppVoidThunk<AsyncAction>): ThunkCustomWrapper<void> {
  return () => appThunk;
}
