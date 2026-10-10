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

/**
 * Character limits for user-editable text fields.
 *
 * These mirror the backend's authoritative limits in
 * `ord_app/service_api/schemas/base.py` (`MAX_CRITICAL_FIELD_LENGTH` and
 * `MAX_FIELD_LENGTH`). Enforcing them in the UI via `maxLength` prevents users
 * from typing past the limit instead of failing with an HTTP 422 on submit.
 */

/** Limit for names and other short, critical fields (group/dataset/template names). */
export const MAX_CRITICAL_FIELD_LENGTH = 512;

/** Limit for descriptions and other longer free-text fields. */
export const MAX_FIELD_LENGTH = 8192;
