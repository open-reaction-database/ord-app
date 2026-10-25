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
import { Badge, Paper, Text } from '@mantine/core';

/** A standing note, not an alert, so it is not announced when the page loads. */
export function BetaNote() {
  return (
    <Paper
      p="sm"
      radius="md"
      bg="var(--mantine-color-yellow-light)"
    >
      {/* Mantine's light yellow text is too faint to read on the light tint. */}
      <Text size="sm">
        This feature is in beta — results may be incomplete or change.
      </Text>
    </Paper>
  );
}

/** The note's mark, for beside a heading where the whole note would crowd the page. */
export function BetaBadge() {
  return (
    <Badge
      color="yellow"
      autoContrast
    >
      Beta
    </Badge>
  );
}
