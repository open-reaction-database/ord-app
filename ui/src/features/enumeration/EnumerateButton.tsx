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
import { ArticleIcon } from 'common/icons';
import { colorToCssVariable } from 'common/styling/colors.ts';
import { PaperButton } from 'common/components/interactions/PaperButton/PaperButton.tsx';
import { useCallback } from 'react';
import { setEnumerationSetupOpenedAction } from 'store/features/enumerationSetup/enumerationSetup.actions.ts';
import { useAppDispatch } from 'store/useAppDispatch.ts';

export function EnumerateButton() {
  const dispatch = useAppDispatch();

  const openEnumerationSetup = useCallback(() => {
    dispatch(setEnumerationSetupOpenedAction(true));
  }, [dispatch]);

  return (
    <PaperButton
      title="Enumerate"
      description="Create dataset from template"
      icon={<ArticleIcon />}
      color={colorToCssVariable['orange']}
      onClick={openEnumerationSetup}
    />
  );
}
