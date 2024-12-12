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
  fontSizes: {
    sm: '0.875rem',
    md: '0.875rem',
  },
  lineHeights: {
    md: '1.5',
  },
  headings: {
    sizes: {
      h1: {
        fontSize: '2rem',
        lineHeight: '1.25',
      },
      h2: {
        fontSize: '1.5rem',
        lineHeight: '1.34',
      },
      h3: {
        fontSize: '0.875rem',
        lineHeight: '1.5',
      },
      h4: {
        fontSize: '0.75rem',
        lineHeight: '1.34',
      },
    },
  },
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
    lg: '1.5rem',
    xl: '2rem',
  },
});
