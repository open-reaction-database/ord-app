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
// The same separators the enumeration worker reads: a T or a space before the time.
const WITH_OFFSET = /[T ][\d:.]+(Z|[+-]\d{2}:?\d{2})$/;
const FRACTION = /\.\d+(?=(Z|[+-]\d{2}:?\d{2})?$)/;

// dayjs keeps a time only to the millisecond, so the fraction of a second is carried over from
// `source` as written; a shift between zones moves whole minutes and leaves it unchanged.
// `format` spells the seconds `ss`.
export function formatWithFraction(
  date: dayjs.Dayjs,
  format: string,
  source: string,
): string {
  const fraction = FRACTION.exec(source)?.[0];
  return date.format(fraction ? format.replace('ss', `ss[${fraction}]`) : format);
}

export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value);
}

// A date, or a time without an offset, names no instant, so it is never shifted between zones.
export function hasOffset(value: string): boolean {
  return WITH_OFFSET.test(value);
}

export function convertOffsetDateToUtc(inputDate: string): dayjs.Dayjs {
  return dayjs.utc(inputDate);
}

export function convertUtcDateToUserTZ(inputDate: string): dayjs.Dayjs {
  return dayjs.utc(inputDate).tz(userTimezone);
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
