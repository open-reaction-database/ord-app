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
interface FormattingRule {
  formatted: string;
  category?: 'unit' | 'abbreviation' | 'general';
  description?: string;
}

type FormattingDictionary = Record<string, FormattingRule>;

export const textFormattingDictionary: FormattingDictionary = {
  GRAM_PER_MOL: {
    formatted: 'g/mol',
    category: 'unit',
    description: 'Grams per mole unit',
  },
  MILLILITER: {
    formatted: 'mL',
    category: 'unit',
    description: 'Milliliter unit',
  },

  NMR_SOLVENT: {
    formatted: 'NMR Solvent',
    category: 'abbreviation',
    description: 'Nuclear Magnetic Resonance Solvent',
  },

  REACTION_SETUP: {
    formatted: 'Reaction Setup',
    category: 'general',
    description: 'Reaction setup section title',
  },
  CRUDE_COMPONENTS: {
    formatted: 'Crude Components',
    category: 'general',
    description: 'Crude components section',
  },
};

export function formatText(text: string, fallbackToHumanized = true): string {
  const formattingRule = textFormattingDictionary[text];

  if (formattingRule) {
    return formattingRule.formatted;
  }

  if (fallbackToHumanized) {
    return humanizeText(text);
  }

  return text;
}

function humanizeText(text: string): string {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
