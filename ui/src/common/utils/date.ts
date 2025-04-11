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
import { DATE_TIME_HUMAN_FORMAT } from '../constants.ts';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = dayjs.tz.guess();

export function convertUtcDateToUserTZ(inputDate: string): dayjs.Dayjs {
  return dayjs.utc(inputDate).tz(userTimezone);
}

export function convertUserTZDateToUtc(inputDate: string | Date): dayjs.Dayjs {
  return dayjs.tz(inputDate, userTimezone).utc();
}

export function formatUtcDateToDisplay(inputDate: string) {
  return convertUtcDateToUserTZ(inputDate).format(DATE_TIME_HUMAN_FORMAT);
}
