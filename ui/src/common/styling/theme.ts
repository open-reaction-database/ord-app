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
import { colorsTuple, createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  colors: {
    primary: colorsTuple('#3C78D8'),
  },
  primaryColor: 'primary',
  radius: {
    xs: '2px',
    sm: '6px',
    md: '10px',
    lg: '24px',
    xl: '36px',
  },
  spacing: {
    xs: '0.375rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '2rem',
    xl: '3rem',
  },
});
