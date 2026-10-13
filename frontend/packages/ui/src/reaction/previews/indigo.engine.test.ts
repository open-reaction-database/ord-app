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
// @vitest-environment node
//
// Real Indigo, which loads under Node but not under happy-dom. The editor's Ketcher bundles
// this Indigo release and, standalone, reaches it through the same calls: a structure loads
// onto the canvas through `layout` (a CXSMILES without coordinates has none to keep) and
// saves through `convert`.
import { beforeAll, describe, expect, it } from 'vitest';
// indigo-ketcher ships no types.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import indigoInit from 'indigo-ketcher';
import { renderSvg, waitForIndigo } from './indigo.ts';

interface Indigo {
  MapStringString: new () => { set(key: string, value: string): void };
  layout(struct: string, outputFormat: string, options: unknown): string;
  convert(struct: string, outputFormat: string, options: unknown): string;
}

const KET = 'chemical/x-indigo-ket';
const CXSMILES = 'chemical/x-chemaxon-cxsmiles';
const MOLFILE = 'chemical/x-mdl-molfile';

let indigo: Indigo;

beforeAll(async () => {
  indigo = (await indigoInit()) as Indigo;
  await waitForIndigo();
});

function call(method: 'layout' | 'convert', struct: string, outputFormat: string) {
  const options = new indigo.MapStringString();
  options.set('output-content-type', 'application/json');
  return (
    JSON.parse(indigo[method](struct, outputFormat, options)) as { struct: string }
  ).struct;
}

const onCanvas = (cxsmiles: string) => call('layout', cxsmiles, KET);

describe('Indigo', () => {
  it.each([
    ['a racemate', 'C[C@H](N)C(=O)O |&1:1|', '&1:1'],
    ['an unknown single enantiomer', 'C[C@H](N)C(=O)O |o1:1|', 'o1:1'],
  ])('keeps %s through the canvas and back to CXSMILES', (_, cxsmiles, group) => {
    expect(call('convert', onCanvas(cxsmiles), CXSMILES)).toContain(group);
  });

  it('saves a stereo group drawn on the canvas into a V3000 molblock', () => {
    const molblock = call('convert', onCanvas('C[C@H](N)C(=O)O |&1:1|'), MOLFILE);
    expect(molblock).toContain('V3000');
    expect(molblock).toContain('STERAC');
  });

  it('renders a CXSMILES identifier for its preview', () => {
    expect(renderSvg('C[C@H](N)C(=O)O |&1:1|')).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});
