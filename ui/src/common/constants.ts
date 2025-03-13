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
import type { Pagination } from './types';
import type { DownloadMenuOptions } from './types/downloadMenuOptions';

export const isDev = !import.meta.env.PROD;

export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
export const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;
export const auth0Issuer = import.meta.env.VITE_AUTH0_ISSUER as string;
export const auth0Scope = import.meta.env.VITE_AUTH0_SCOPE as string;

export const domain = window.location.origin;

export const emptyPagination: Pagination = { page: 1, size: 10, total: 0, pages: 0 };

export const fileDownloadOptions: Array<DownloadMenuOptions> = [
  { label: '.binpb', format: 'binpb' },
  { label: '.txtpb', format: 'txtpb' },
  { label: '.json', format: 'json' },
];

export const DOT_DELIMITER = '·';
