/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// This is a test-only render helper, not an HMR boundary, so the component/export mix is fine.
/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';

function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return <MantineProvider>{children}</MantineProvider>;
}

/** Renders a component inside a MantineProvider, required by any component using Mantine primitives. */
export function renderWithMantine(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Providers, ...options });
}
