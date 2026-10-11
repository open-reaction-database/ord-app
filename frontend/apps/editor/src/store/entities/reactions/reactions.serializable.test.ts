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
import { describe, it, expect } from 'vitest';
import { toBinary } from '@bufbuild/protobuf';
import { findNonSerializableValue } from '@reduxjs/toolkit';
import { base64Encode } from '@bufbuild/protobuf/wire';
import { ReactionSchema } from '@buf/open-reaction-database_ord-schema.bufbuild_es/ord-schema/proto/reaction_pb';
import { fullReaction } from '@open-reaction-database/ui/testing';
import { ordBinpbToReaction } from '@open-reaction-database/ui/reaction/model';

// The store holds app reactions, so a decoded one must pass Redux's serializability check.
describe('binpb conversion', () => {
  it('decodes to a serializable app reaction without protobuf-es messages', () => {
    const appReaction = ordBinpbToReaction(
      base64Encode(toBinary(ReactionSchema, fullReaction)),
    );
    expect(findNonSerializableValue(appReaction)).toBe(false);
    expect(JSON.stringify(appReaction)).not.toContain('$typeName');
  });
});
