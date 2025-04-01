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
import { useAppDispatch } from '../../store/useAppDispatch.ts';
import { useSelector } from 'react-redux';
import { selectEnumerationProgress } from '../../store/entities/enumeration/enumeration.selectors.ts';
import { useCallback } from 'react';
import { interruptEnumerationAction } from '../../store/entities/enumeration/enumeration.actions.ts';
import { setEnumerationSetupOpenedAction } from '../../store/features/enumerationSetup/enumerationSetup.actions.ts';
import { selectIsEnumerationSetupOpened } from '../../store/features/enumerationSetup/enumerationSetup.selectors.ts';
import { EnumerationSetup, type CreateDatasetFromEnumerationProps } from './EnumerationSetup/EnumerationSetup.tsx';
import { EnumerationResult } from './EnumerationResult/EnumerationResult.tsx';
import { EnumerationProgressDisplay } from './EnumerationProgress/EnumerationProgress.tsx';

export function EnumerationWizard(setupProps: Readonly<Omit<CreateDatasetFromEnumerationProps, 'onClose'>>) {
  const dispatch = useAppDispatch();
  const enumerationProgress = useSelector(selectEnumerationProgress);

  const onEnumerationCancel = useCallback(() => {
    dispatch(interruptEnumerationAction());
  }, [dispatch]);

  const closeEnumerationSetup = useCallback(() => {
    dispatch(setEnumerationSetupOpenedAction(false));
  }, [dispatch]);

  const isSetupOpened = useSelector(selectIsEnumerationSetupOpened);

  return (
    <>
      {isSetupOpened && (
        <EnumerationSetup
          onClose={closeEnumerationSetup}
          {...setupProps}
        />
      )}
      {enumerationProgress?.finished && (
        <EnumerationResult
          enumerationProgress={enumerationProgress}
          onClose={onEnumerationCancel}
        />
      )}
      {enumerationProgress && !enumerationProgress.finished && (
        <EnumerationProgressDisplay
          enumerationProgress={enumerationProgress}
          onClose={onEnumerationCancel}
        />
      )}
    </>
  );
}
