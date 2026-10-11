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
import type { AnyAsyncAction } from 'common/types';
import type { AppThunk, AppVoidThunk, ThunkWrapper } from 'common/types/store/thunk.ts';
import { isAxiosError } from 'axios';
import {
  showNotification,
  NotificationVariant,
} from '@open-reaction-database/ui/display';

function processAxiosError(error: unknown): string | null {
  if (isAxiosError(error)) {
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

export interface ThunkOptions {
  /** Shown when the thunk fails without a message of its own from the backend. */
  failureMessage?: string;
}

/** Shows the backend's message for a failure, or else `failureMessage`; returns the former. */
function reportFailure(error: unknown, failureMessage?: string): string | null {
  const detail = processAxiosError(error);
  if (detail === null && failureMessage) {
    showNotification({ variant: NotificationVariant.ERROR, message: failureMessage });
  }
  return detail;
}

export function createThunk<AsyncAction extends AnyAsyncAction>(
  asyncActionCreator: AsyncAction,
  appThunk: AppThunk<AsyncAction>,
  { failureMessage }: ThunkOptions = {},
): ThunkWrapper<AsyncAction> {
  return extraArgument => {
    return async dispatch => {
      dispatch(asyncActionCreator.request(extraArgument));
      try {
        const result = await dispatch(appThunk(extraArgument));
        dispatch(result);
        return result;
      } catch (e) {
        const result = reportFailure(e, failureMessage);
        dispatch(asyncActionCreator.failure(result));
        return;
      }
    };
  };
}

export function createThunkWithExplicitResult<AsyncAction extends AnyAsyncAction>(
  asyncActionCreator: AsyncAction,
  appThunk: AppVoidThunk<AsyncAction>,
  { failureMessage }: ThunkOptions = {},
): ThunkWrapper<AsyncAction> {
  return extraArgument => {
    return async dispatch => {
      dispatch(asyncActionCreator.request(extraArgument));
      try {
        await dispatch(appThunk(extraArgument));
      } catch (e) {
        const result = reportFailure(e, failureMessage);
        dispatch(asyncActionCreator.failure(result));
        return;
      }
    };
  };
}
