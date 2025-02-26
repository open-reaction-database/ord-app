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
// ketcher-indigo package doesn't provide types
// eslint-disable-next-line
// @ts-ignore
import indigoInit from 'indigo-ketcher';
import { Buffer } from 'buffer';

let indigoModule: ReturnType<indigoInit>;
let indigoPromise: Promise<void>;

export function initIndigo() {
  indigoPromise = indigoInit().then((result: typeof indigoModule) => (indigoModule = result));
}

export function waitForIndigo() {
  if (!indigoPromise) {
    initIndigo();
  }
  return indigoPromise;
}

export function renderSvg(component: string | null, size: number = 120) {
  if (component === null || !indigoModule) return null;

  const options = new indigoModule.MapStringString();
  options.set('bond-length', '24');
  options.set('render-output-format', 'svg');
  options.set('smart-layout', 'true');
  options.set('render-image-max-height', size.toString());
  options.set('ignore-stereochemistry-errors', 'true');
  options.set('render-coloring', 'true');
  try {
    return Buffer.from(indigoModule.render(component, options), 'base64').toString('base64');
  } catch (e) {
    console.error(e);
    return null;
  }
}
