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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  DATE_HUMAN_FORMAT,
  DATE_TIME_HUMAN_FORMAT,
} from '#reaction/model/reactionFormats.ts';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = dayjs.tz.guess();

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// A date with no time names a day in no particular zone, so it is never shifted between zones.
export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value);
}

export function convertUtcDateToUserTZ(inputDate: string): dayjs.Dayjs {
  return dayjs.utc(inputDate).tz(userTimezone);
}

export function convertUserTZDateToUtc(inputDate: string | Date): dayjs.Dayjs {
  return dayjs.tz(inputDate, userTimezone).utc();
}

export function formatUtcDateToDisplay(inputDate: string) {
  return convertUtcDateToUserTZ(inputDate).format(DATE_TIME_HUMAN_FORMAT);
}

export function formatDateToDisplay(inputDate: string | Date) {
  // A date alone carries no time of day, so none is shown.
  if (typeof inputDate === 'string' && isDateOnly(inputDate)) {
    return dayjs(inputDate).format(DATE_HUMAN_FORMAT);
  }
  return dayjs(inputDate).format(DATE_TIME_HUMAN_FORMAT);
}
