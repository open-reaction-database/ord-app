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
import { Route, Switch } from 'wouter';
import { TemplatesListPage } from '../../pages/TemplatesList/TemplatesList.page.tsx';
import { TemplatePage } from 'pages/TemplatePage/TemplatePage.tsx';
import { templatesContext } from 'features/templates/templates.context.ts';
import { useMemo } from 'react';

export function TemplatesListRoute() {
  const contextValue = useMemo(
    () => ({
      isTemplate: true,
    }),
    [],
  );

  return (
    <Switch>
      <templatesContext.Provider value={contextValue}>
        <Route path=":templateId">
          <TemplatePage />
        </Route>
        <Route path="/">
          <TemplatesListPage />
        </Route>
      </templatesContext.Provider>
    </Switch>
  );
}
