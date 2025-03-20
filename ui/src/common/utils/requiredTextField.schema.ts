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
import * as yup from 'yup';

export const emptyFieldMessage = (label: string) => `${label} should not be empty`;

export const requiredTextField = (label: string) =>
  yup
    .string()
    .label(label)
    .required(emptyFieldMessage(label))
    .test('no-only-spaces', emptyFieldMessage(label), value => value?.trim().length > 0);
