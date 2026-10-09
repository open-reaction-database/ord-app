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
import axios from 'axios';

export interface RejectValue {
  errorCode: number;
  errorMessage?: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  403: 'Access denied',
  404: 'Entity not found',
  500: 'Unknown error',
};

// FastAPI puts an error's explanation in `detail`: a sentence for an error the backend
// raises, and a list of field errors when a request fails validation, which has no
// short form to show.
const messageFromBody = (data: unknown): string | undefined => {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const { detail, message } = data as { detail?: unknown; message?: unknown };
  if (typeof detail === 'string') {
    return detail;
  }
  return typeof message === 'string' ? message : undefined;
};

export function getErrorDetails(error: unknown): RejectValue {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const message =
      messageFromBody(error.response?.data) ??
      ERROR_MESSAGES[status] ??
      ERROR_MESSAGES[500];
    return { errorCode: status, errorMessage: message };
  }
  return { errorCode: 500, errorMessage: ERROR_MESSAGES[500] };
}

export const handleApiError = (error: unknown): RejectValue => {
  return getErrorDetails(error);
};
