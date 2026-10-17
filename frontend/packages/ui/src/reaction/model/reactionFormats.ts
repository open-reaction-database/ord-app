/*
 * Copyright 2026 Open Reaction Database Project Authors
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
export const DOT_DELIMITER = '·';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

// A time as it is written to ord: in UTC, with the Z that says so. ord-schema accepts a
// DateTime only as a date alone or a time with its offset.
export const ORD_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';

export const DATE_HUMAN_FORMAT = 'DD.MM.YYYY';

export const DATE_TIME_HUMAN_FORMAT = 'DD.MM.YYYY hh:mm a';

// 1 MB
export const MAX_DATA_FILE_SIZE = 1024 * 1024;
