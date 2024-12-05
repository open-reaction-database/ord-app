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
    primary: [
      '#D9F1FD',
      '#A9DCF7',
      '#7ECEF8',
      '#53BDF5',
      '#1AA6F1',
      '#0083C9',
      '#006296',
      '#013958',
      '#012436',
      '#001926',
    ],
    secondary: [
      '#E7EBEF',
      '#DAE1E7',
      '#CED7DE',
      '#C2CDD6',
      '#B6C3CD',
      '#92A5B5',
      '#7991A4',
      '#637D92',
      '#4A5E6D',
      '#323F49',
    ],
    neutral: [
      '#E8EBED',
      '#D2D6DB',
      '#BBC2C9',
      '#A4ADB6',
      '#828F9B',
      '#64707D',
      '#40474F',
      '#2D3339',
      '#2B2829',
      '#121417',
    ],
    success: colorsTuple('#A4F4E7'),
    warning: colorsTuple('#F4C790'),
    error: colorsTuple('#E4626F'),
    white: colorsTuple('#FCFCFC'),
    black: colorsTuple('#090A0B'),
  },
  primaryColor: 'primary',
  primaryShade: 5,
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
