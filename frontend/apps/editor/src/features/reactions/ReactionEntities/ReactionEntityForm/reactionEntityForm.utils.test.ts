/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { create } from '@bufbuild/protobuf';
import {
  CompoundIdentifier_CompoundIdentifierType,
  CompoundSchema,
  Mass_MassUnit,
  ReactionRole_ReactionRoleType,
} from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { copyReactionPart, pasteReactionPart } from './reactionEntityForm.utils.ts';
import { ReactionNodeEntity } from 'store/entities/reactions/reactions.types.ts';
import { ordNotesToReaction } from 'store/entities/reactions/reactionNotes/reactionNotes.converters.ts';
import { ordInputComponentToReaction } from 'store/entities/reactions/reactionComponent/reactionComponent.converters.ts';
import type { ReactionInputComponent } from 'store/entities/reactions/reactionComponent/reactionComponent.types.ts';
import {
  AppDataType,
  type AppData,
} from 'store/entities/reactions/reactionData/reactionData.types.ts';
import type { ReactionNotes } from 'store/entities/reactions/reactionNotes/reactionNotes.types.ts';
import { ReactionBoolean } from 'store/entities/reactions/reactionEntity/reactionEntity.types.ts';
import { ordReactionToReaction } from 'store/entities/reactions/reactions.converters.ts';
import { fullReaction } from 'test/fullReaction.ts';

vi.mock('common/utils/showNotification.tsx', () => ({ showNotification: vi.fn() }));

/** Backs navigator.clipboard with an in-memory string so write/read round-trip in tests. */
function stubClipboard() {
  let stored = '';
  const writeText = vi.fn((text: string) => {
    stored = text;
    return Promise.resolve();
  });
  const readText = vi.fn(() => Promise.resolve(stored));
  vi.stubGlobal('navigator', { clipboard: { writeText, readText } });
  return { writeText, readText, setStored: (text: string) => (stored = text) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyReactionPart', () => {
  it('writes a JSON envelope tagging the entity type to the clipboard', async () => {
    const { writeText } = stubClipboard();
    await copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null));
    expect(writeText).toHaveBeenCalledOnce();
    const envelope = JSON.parse(writeText.mock.calls[0][0]);
    expect(envelope.type).toBe(ReactionNodeEntity.Notes);
    expect(envelope).toHaveProperty('value');
  });

  it('writes the proto3 JSON of the ord message, with numeric enums', async () => {
    const { writeText } = stubClipboard();
    const component = ordInputComponentToReaction(
      create(CompoundSchema, {
        reactionRole: ReactionRole_ReactionRoleType.REACTANT,
        identifiers: [
          { type: CompoundIdentifier_CompoundIdentifierType.SMILES, value: 'CCO' },
        ],
        amount: {
          kind: { case: 'mass', value: { value: 1.5, units: Mass_MassUnit.GRAM } },
        },
      }),
    );
    await copyReactionPart(ReactionNodeEntity.Components, component);
    const envelope = JSON.parse(writeText.mock.calls[0][0]);
    expect(envelope.value).toEqual({
      identifiers: [
        { type: CompoundIdentifier_CompoundIdentifierType.SMILES, value: 'CCO' },
      ],
      amount: { mass: { value: 1.5, units: Mass_MassUnit.GRAM } },
      reactionRole: ReactionRole_ReactionRoleType.REACTANT,
    });
  });

  it('swallows clipboard write failures instead of throwing', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) },
    });
    await expect(
      copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null)),
    ).resolves.toBeUndefined();
  });
});

describe('pasteReactionPart', () => {
  it('round-trips a copied chunk back into a reaction part', async () => {
    stubClipboard();
    await copyReactionPart(ReactionNodeEntity.Notes, ordNotesToReaction(null));
    const [result, text] = await pasteReactionPart(ReactionNodeEntity.Notes);
    expect(result).not.toBeNull();
    expect(text).not.toBe('');
    // id/name are stripped by the paste so they don't overwrite the target entity's identity.
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('name');
  });

  it('round-trips a component with an amount', async () => {
    stubClipboard();
    const component = ordInputComponentToReaction(
      create(CompoundSchema, {
        reactionRole: ReactionRole_ReactionRoleType.REACTANT,
        isLimiting: true,
        amount: {
          kind: { case: 'mass', value: { value: 1.5, units: Mass_MassUnit.GRAM } },
        },
      }),
    );
    await copyReactionPart(ReactionNodeEntity.Components, component);
    const [result] = await pasteReactionPart(ReactionNodeEntity.Components);
    const { id: _, ...expected } = component;
    expect(result).toEqual(expected);
  });

  it('reads clipboard JSON with null fields, extra keys, and base64 bytes', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored(
      JSON.stringify({
        type: ReactionNodeEntity.Components,
        value: {
          reactionRole: ReactionRole_ReactionRoleType.REACTANT,
          texture: null,
          identifiers: [
            {
              id: 'not-an-ord-field',
              type: CompoundIdentifier_CompoundIdentifierType.SMILES,
              value: 'CCO',
              details: null,
            },
          ],
          features: { image: { description: 'd', format: 'png', bytesValue: 'YWJj' } },
          isLimiting: null,
          source: null,
          preparations: [],
          amount: {
            volumeIncludesSolutes: null,
            mass: { value: 1.5, precision: null, units: Mass_MassUnit.GRAM },
          },
        },
      }),
    );
    const [result] = await pasteReactionPart(ReactionNodeEntity.Components);
    const component = result as ReactionInputComponent;
    expect(component.reactionRole).toBe('REACTANT');
    expect(component.isLimiting).toBe(ReactionBoolean.Unspecified);
    expect(component.amount).toMatchObject({ value: 1.5, units: 'GRAM' });
    expect(component.identifiers).toHaveLength(1);
    expect(component.identifiers[0]).toMatchObject({ type: 'SMILES', value: 'CCO' });
    const [feature] = Object.values(component.features) as Array<AppData>;
    expect(feature.data).toMatchObject({ type: AppDataType.Upload, value: 'YWJj' });
  });

  it('reads a null value as an empty entity', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored(
      JSON.stringify({ type: ReactionNodeEntity.Notes, value: null }),
    );
    const [result] = await pasteReactionPart(ReactionNodeEntity.Notes);
    expect((result as ReactionNotes).isExothermic).toBe(ReactionBoolean.Unspecified);
  });

  it('rejects a chunk whose entity type does not match the target field', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored(
      JSON.stringify({ type: ReactionNodeEntity.Conditions, value: {} }),
    );
    expect(await pasteReactionPart(ReactionNodeEntity.Notes)).toEqual([null, '']);
  });

  it('returns a null result for invalid clipboard JSON', async () => {
    const clipboard = stubClipboard();
    clipboard.setStored('not valid json');
    expect(await pasteReactionPart(ReactionNodeEntity.Notes)).toEqual([null, '']);
  });
});

// Copy converts an entity to the ord message that ordSchemaByNodeEntity names, and paste
// converts it back. A converter or message that loses a field does so without an error.
describe('copy and paste of each entity type', () => {
  const reaction = ordReactionToReaction(fullReaction);
  const [input] = Object.values(reaction.inputs);
  const [component] = input.components;
  const [outcome] = reaction.outcomes;
  const { conditions, provenance, setup } = reaction;
  const [workup] = reaction.workups;
  const entitiesByType: Record<ReactionNodeEntity, Array<object | null>> = {
    [ReactionNodeEntity.Inputs]: [input],
    [ReactionNodeEntity.Input]: [workup.input],
    [ReactionNodeEntity.Outcomes]: [outcome],
    [ReactionNodeEntity.Identifiers]: reaction.identifiers,
    [ReactionNodeEntity.Setup]: [setup],
    [ReactionNodeEntity.Notes]: [reaction.notes],
    [ReactionNodeEntity.Components]: [component],
    [ReactionNodeEntity.CrudeComponents]: input.crudeComponents,
    [ReactionNodeEntity.ComponentPreparations]: component.preparations,
    [ReactionNodeEntity.Features]: Object.values(component.features),
    [ReactionNodeEntity.ComponentIdentifiers]: [
      ...component.molBlockIdentifiers,
      ...component.identifiers,
    ],
    [ReactionNodeEntity.Analyses]: Object.values(outcome.analyses),
    [ReactionNodeEntity.Products]: outcome.products,
    [ReactionNodeEntity.Measurements]: outcome.products[0].measurements,
    [ReactionNodeEntity.Observations]: reaction.observations,
    [ReactionNodeEntity.Provenance]: [provenance],
    [ReactionNodeEntity.RecordModified]: provenance.recordModified,
    [ReactionNodeEntity.Conditions]: [conditions],
    [ReactionNodeEntity.Workups]: [workup],
    [ReactionNodeEntity.TemperatureMeasurements]:
      conditions.temperature.temperatureMeasurements,
    [ReactionNodeEntity.ElectrochemistryMeasurements]:
      conditions.electrochemistry.electrochemistryMeasurements,
    [ReactionNodeEntity.PressureMeasurements]: conditions.pressure.pressureMeasurements,
    [ReactionNodeEntity.VesselPreparations]: setup.vessel.vesselPreparations,
    [ReactionNodeEntity.VesselAttachments]: setup.vessel.vesselAttachments,
  };

  it.each(Object.entries(entitiesByType))(
    'keeps every field of %s',
    async (type, entities) => {
      const entityType = type as ReactionNodeEntity;
      expect(entities.length).toBeGreaterThan(0);
      for (const entity of entities) {
        expect(entity).not.toBeNull();
        stubClipboard();
        await copyReactionPart(entityType, entity as object);
        const [pasted] = await pasteReactionPart(entityType);
        const { name: _, ...expected } = entity as { name?: string };
        expect(withoutIds(pasted)).toEqual(withoutIds(expected));
      }
    },
  );
});

// Pasting assigns new random ids. Drops `id` fields and turns records keyed by id into arrays.
function withoutIds(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutIds);
  }
  if (value === null || typeof value !== 'object' || value instanceof Uint8Array) {
    return value;
  }
  const entries = Object.entries(value).filter(([key]) => key !== 'id');
  const isKeyedById =
    entries.length > 0 &&
    entries.every(([key, item]) => (item as { id?: unknown } | null)?.id === key);
  return isKeyedById
    ? entries.map(([, item]) => withoutIds(item))
    : Object.fromEntries(entries.map(([key, item]) => [key, withoutIds(item)]));
}
