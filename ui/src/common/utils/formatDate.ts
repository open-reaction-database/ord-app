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
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Formats a string in ISO format into a human-readable date string using date-fns library
 *
 * @param inputDate - String in ISO format
 * @returns
 */
export function formatDate(inputDate: string) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = fromZonedTime(inputDate, 'UTC');
  const localDate = toZonedTime(utcDate, userTimeZone);

  return format(localDate, 'dd.MM.yyyy hh:mm a');
}
