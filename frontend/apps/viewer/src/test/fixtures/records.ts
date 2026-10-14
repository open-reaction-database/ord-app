/**
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

// Written by scripts/fixture-records.py; regenerate rather than edit.
import type { ReactionRecord } from '#api/types.ts';

export const VIEWER0101: ReactionRecord = {
  reaction_id: 'ord-viewer0101',
  dataset_id: 'ord_dataset-viewer01',
  binpb:
    'EjgKCXJlYWN0YW50cxIrChUKEQgCGg1PQihPKWMxY2NjY2MxGAEKEgoOCAIaCkJyYzFjY25jYzEYAUImGiQKFwgCGhNjMWNjYygtYzJjY25jYzIpY2MxGgkQA0IFDQAAgkJSDm9yZC12aWV3ZXIwMTAx',
  molblocks: {
    inputs: {
      reactants: [
        '\n     RDKit          2D\n\n  9  9  0  0  0  0  0  0  0  0999 V2000\n    3.7500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.0000    0.0000    0.0000 B   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7500    1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  1  0\n  2  4  1  0\n  4  5  2  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9  4  1  0\nM  END\n',
        '\n     RDKit          2D\n\n  7  7  0  0  0  0  0  0  0  0999 V2000\n    3.0000    0.0000    0.0000 Br  0  0  0  0  0  0  0  0  0  0  0  0\n    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.5000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  1  0\n  3  4  2  0\n  4  5  1  0\n  5  6  2  0\n  6  7  1  0\n  7  2  2  0\nM  END\n',
      ],
    },
    outcomes: [
      {
        products: [
          {
            molblock:
              '\n     RDKit          2D\n\n 12 13  0  0  0  0  0  0  0  0999 V2000\n    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -6.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n   -5.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   -0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    0.7500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  2  0\n  2  3  1  0\n  3  4  2  0\n  4  5  1  0\n  5  6  1  0\n  6  7  2  0\n  7  8  1  0\n  8  9  2  0\n  9 10  1  0\n  4 11  1  0\n 11 12  2  0\n 12  1  1  0\n 10  5  2  0\nM  END\n',
            measurements: [{ authentic_standard: { molblock: null } }],
          },
        ],
      },
    ],
    workups: [],
  },
};

export const VIEWER0102: ReactionRecord = {
  reaction_id: 'ord-viewer0102',
  dataset_id: 'ord_dataset-viewer01',
  binpb:
    'EjkKCXJlYWN0YW50cxIsChgKFAgCGhBDW0NAQEhdKE4pQyg9TylPGAEKEAoMCAIaCENDKD1PKUNsGAFCKRonChoIAhoWQ1tDQEBIXShOQyhDKT1PKUMoPU8pTxoJEANCBQ0AALRCUg5vcmQtdmlld2VyMDEwMg==',
  molblocks: {
    inputs: {
      reactants: [
        '\n     RDKit          2D\n\n  6  5  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    2.2500    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -1.5000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8971    0.7500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  1\n  2  3  1  0\n  2  4  1  0\n  4  5  2  0\n  4  6  1  0\nM  END\n',
        '\n     RDKit          2D\n\n  4  3  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    2.2500    0.0000 Cl  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  2  0\n  2  4  1  0\nM  END\n',
      ],
    },
    outcomes: [
      {
        products: [
          {
            molblock:
              '\n     RDKit          2D\n\n  9  8  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    2.2500    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981    3.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981    4.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8971    2.2500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -1.5000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8971    0.7500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  1\n  2  3  1  0\n  3  4  1  0\n  4  5  1  0\n  4  6  2  0\n  2  7  1  0\n  7  8  2  0\n  7  9  1  0\nM  END\n',
            measurements: [{ authentic_standard: { molblock: null } }],
          },
        ],
      },
    ],
    workups: [],
  },
};

export const VIEWER0103: ReactionRecord = {
  reaction_id: 'ord-viewer0103',
  dataset_id: 'ord_dataset-viewer01',
  binpb:
    'EiwKCXJlYWN0YW50cxIfCgsKBwgCGgNDQ04YAQoQCgwIAhoIQ0MoPU8pQ2wYAUIcGhoKDQgCGglDQ05DKEMpPU8aCRADQgUNAACWQlIOb3JkLXZpZXdlcjAxMDM=',
  molblocks: {
    inputs: {
      reactants: [
        '\n     RDKit          2D\n\n  3  2  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  1  0\nM  END\n',
        '\n     RDKit          2D\n\n  4  3  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    2.2500    0.0000 Cl  0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  2  0\n  2  4  1  0\nM  END\n',
      ],
    },
    outcomes: [
      {
        products: [
          {
            molblock:
              '\n     RDKit          2D\n\n  6  5  0  0  0  0  0  0  0  0999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.5981   -0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8971    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.1962   -0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.8971    2.2500    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0\n  2  3  1  0\n  3  4  1  0\n  4  5  1  0\n  4  6  2  0\nM  END\n',
            measurements: [{ authentic_standard: { molblock: null } }],
          },
        ],
      },
    ],
    workups: [],
  },
};
