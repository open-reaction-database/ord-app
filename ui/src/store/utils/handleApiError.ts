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
  errorMessage: string;
}

export function getErrorDetails(error: unknown): RejectValue {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const message = error.response?.data?.message || 'Unknown error';
    return { errorCode: status, errorMessage: message };
  }
  return { errorCode: 500, errorMessage: 'Unknown error' };
}

export const handleApiError = (error: unknown): RejectValue => {
  const errorDetails = getErrorDetails(error);
  return errorDetails;
};
