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
import { useCallback, useContext, useMemo } from 'react';
import { reactionEntityContext } from 'features/reactions/ReactionEntities/reactionEntity.context.ts';
import { selectReactionPartByPath } from 'store/entities/reactions/reactions.selectors.ts';
import { useSelector } from 'react-redux';
import type { ReactionOutcome } from 'store/entities/reactions/reactionsOutcomes/reactionOutcomes.types.ts';
import { Select } from '@mantine/core';
import type { ReactionFormCustomProps } from 'features/reactions/ReactionEntities/reactionEntities.types.ts';
import { useUncontrolled } from '@mantine/hooks';
import { itemsById } from 'common/utils';

export function MeasurementsBasedOn({ formMethods, name }: Readonly<ReactionFormCustomProps>) {
  const { reactionId, pathComponents } = useContext(reactionEntityContext);
  const outcomePath = pathComponents.slice(0, 2);
  const analysesPath = [...outcomePath, 'analyses'];
  const analyses: ReactionOutcome['analyses'] = useSelector(selectReactionPartByPath(reactionId, analysesPath));
  const [basedOnOptions, analysesByNames] = useMemo(() => {
    const analysesArray = Object.values(analyses);
    return [analysesArray.map(analysis => analysis.name), itemsById(analysesArray, analysis => analysis.name)];
  }, [analyses]);

  const [value, onChange] = useUncontrolled({
    ...formMethods.getInputProps(name),
  });

  const handleSelect = useCallback(
    (name: string | null) => {
      if (name) {
        const analysis = analysesByNames[name];
        onChange({ id: analysis.id, name: analysis.name });
      } else {
        onChange(null);
      }
    },
    [analysesByNames, onChange],
  );

  return (
    <Select
      label="Based on"
      placeholder="Select analysis"
      value={value?.name ?? null}
      data={basedOnOptions}
      onChange={handleSelect}
      allowDeselect
    />
  );
}
