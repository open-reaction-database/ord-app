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
import { createRoot } from 'react-dom/client';
import './index.scss';
import '@open-reaction-database/ui/theme/global.scss';
import { loadAnalytics } from '@open-reaction-database/ui/shell';
import { App } from '#App.tsx';

// The Google tag ord-interface's pages carry.
loadAnalytics('G-REEDLYB0ZJ');

createRoot(document.getElementById('root')!).render(<App />);
