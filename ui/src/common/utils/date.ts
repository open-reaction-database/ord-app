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

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ_FORMAT = 'DD.MM.YYYY hh:mm a';
const userTimezone = dayjs.tz.guess();

export function getDate(inputDate: string): dayjs.Dayjs {
  return dayjs.utc(inputDate).tz(userTimezone);
}

export function getDateFromUser(inputDate: string | Date): dayjs.Dayjs {
  return dayjs.tz(inputDate, userTimezone);
}

export function formatDateFromUser(inputDate: string | Date): string {
  return dayjs.tz(inputDate, userTimezone).utc().format(TZ_FORMAT);
}

export function formatDate(inputDate: string) {
  return getDate(inputDate).format(TZ_FORMAT);
}
