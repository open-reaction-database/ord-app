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
import { format } from 'date-fns';

/**
 * Formats a timestamp into a human-readable date string using date-fns library
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns
 */
export function formatDate(timestamp: number) {
  return format(timestamp, 'dd.MM.yyyy hh:mmaaa');
}
