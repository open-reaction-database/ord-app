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

export interface paths {
  '/api/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Health
     * @description Return the open corpus's fingerprint.
     *
     *     The fingerprint is a precomputed string, so the handler never blocks the event
     *     loop and does not queue behind blocking handlers on the threadpool.
     *
     *     Args:
     *         state: The settings and open corpus the lifespan stored on the app.
     *
     *     Returns:
     *         The fingerprint of the corpus the process serves.
     */
    get: operations['health_api_health_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/datasets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Datasets
     * @description Return every dataset, sorted by name.
     *
     *     Args:
     *         state: The settings and open corpus.
     *
     *     Returns:
     *         The datasets, sorted by name.
     */
    get: operations['list_datasets_api_datasets_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/datasets/newest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Newest Dataset
     * @description Return the dataset that most recently reached ord-data.
     *
     *     Args:
     *         state: The settings and open corpus.
     *
     *     Returns:
     *         The dataset, with the day it arrived, or None when no reaction of a dataset
     *         with an ID has a first commit.
     */
    get: operations['newest_dataset_api_datasets_newest_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/datasets/{dataset_id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Dataset
     * @description Return one dataset.
     *
     *     Args:
     *         dataset_id: The dataset to return.
     *         state: The settings and open corpus.
     *
     *     Returns:
     *         The dataset's summary.
     *
     *     Raises:
     *         HTTPException: 404, if the corpus holds no such dataset.
     */
    get: operations['get_dataset_api_datasets__dataset_id__get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/datasets/{dataset_id}/compounds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Dataset Compounds
     * @description Return the compounds a dataset's inputs or products use most, most first.
     *
     *     It is async so a request waits for its search slot on the event loop; the dataset
     *     lookup, the search, and the molblocks run in worker threads.
     *
     *     Args:
     *         dataset_id: The dataset to count in.
     *         state: The settings and open corpus.
     *         side: Whether to count the reactions' inputs or their products.
     *         limit: The most compounds to return.
     *
     *     Returns:
     *         The compounds with a SMILES, by descending count and then by SMILES.
     *
     *     Raises:
     *         HTTPException: 404 if the corpus holds no such dataset, 422 or 504 if the
     *             search fails.
     *         SlotsBusyError: If every search slot stays busy for the configured wait.
     *         execute.PairingError: If the corpus is inconsistent; a 500.
     */
    get: operations['dataset_compounds_api_datasets__dataset_id__compounds_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reactions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Reactions
     * @description Return up to 100 reactions, named by repeated id parameters.
     *
     *     Args:
     *         state: The settings and open corpus.
     *         reaction_ids: The reactions to return.
     *
     *     Returns:
     *         The known reactions, once each, in the order first asked.
     */
    get: operations['list_reactions_api_reactions_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reactions/{reaction_id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Reaction
     * @description Return one reaction.
     *
     *     Args:
     *         reaction_id: The reaction to return.
     *         state: The settings and open corpus.
     *
     *     Returns:
     *         The reaction with its molblocks.
     *
     *     Raises:
     *         HTTPException: 404, if the corpus holds no such reaction.
     */
    get: operations['get_reaction_api_reactions__reaction_id__get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/download': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Download
     * @description Return the known reactions among the IDs as one gzipped Dataset.
     *
     *     Args:
     *         body: The reaction IDs to download.
     *         state: The settings and open corpus.
     *
     *     Returns:
     *         A gzipped serialized Dataset holding each known reaction once, in the order
     *         first asked.
     *
     *     Raises:
     *         HTTPException: 404, if the corpus holds none of the reactions.
     */
    post: operations['download_api_download_post'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Search
     * @description Run one query: reaction IDs for a plain query, a table for an aggregate.
     *
     *     It is async so a request waits for its search slot on the event loop; the search
     *     and the shaping of its result run in worker threads.
     *
     *     Args:
     *         body: The query to run.
     *         state: The settings, open corpus, and search slots.
     *
     *     Returns:
     *         Reaction IDs for a plain query, or a table for an aggregate.
     *
     *     Raises:
     *         HTTPException: 422 if the query is invalid, 504 if it times out.
     *         SlotsBusyError: If every search slot stays busy for the configured wait.
     *         execute.PairingError: If the corpus is inconsistent; a 500.
     */
    post: operations['search_api_search_post'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/ask': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Ask
     * @description Translate a question into a query, run it, and describe what it found.
     *
     *     It is async so a question waits for its search slot on the event loop; the model
     *     calls, the search, and the shaping of its result run in worker threads.
     *
     *     Args:
     *         body: The question, with any structures it names by placeholder.
     *         state: The settings, open corpus, and search slots.
     *         client: The model client.
     *
     *     Returns:
     *         The query the question became, a sentence about what it found, and the result.
     *
     *     Raises:
     *         HTTPException: 422 if a structure does not fit the question or the grammar,
     *             the question cannot be put to the grammar, the model declined it, or its
     *             query names an unknown compound; 429 if the model is
     *             rate limiting; 502 if the model's query never compiles; 503 if a call to
     *             the model fails for any other reason; 504 if the search times out.
     *         SlotsBusyError: If every search slot stays busy for the configured wait.
     *         execute.PairingError: If the corpus is inconsistent; a 500.
     */
    post: operations['ask_api_ask_post'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * Aggregate
     * @description Group the matching rows and measure each group.
     *
     *     ``group_by`` paths must be scalar, so the number of groups is bounded by the values
     *     a column holds rather than by an explosion over a repeated level.
     *
     *     Each ``group_by`` path is one column of the result, named by the whole path as
     *     written, and each measure is one named by its ``name``. No two may share a name,
     *     whatever their case.
     *
     *     ``over`` changes what a row is. Without it the rows are reactions, and "how many
     *     reactions are automated" is a count of them. With it the rows are the elements of
     *     one repeated level, which is what "the most common solvent" asks for: solvents are
     *     not a column of a reaction, and no grouping of reactions can name one. Paths inside
     *     are then relative to the element, as they are inside a quantifier.
     *
     *     Two filters, because there are two things to filter. This ``where`` selects the
     *     elements grouped -- the components that are solvents. The *query's* ``where``
     *     selects reactions, and says which reactions' elements are counted at all. "The most
     *     common solvents in reactions run above 350 K" needs both, and neither can say what
     *     the other says.
     *
     *     One level, never nested, so the rows are that level's own cardinality rather than a
     *     product: the query stays one pass and a sort, over the pivot instead of over the
     *     projection. ``reaction_id`` is reachable as a measure path and is how a question
     *     about reactions is answered from a relation of elements -- a reaction using THF
     *     twice is one reaction and two rows.
     */
    'Aggregate-Input': {
      /** Over */
      over?: string | null;
      /** Where */
      where?:
        | (
            | components['schemas']['And-Input']
            | components['schemas']['Or-Input']
            | components['schemas']['Not-Input']
            | components['schemas']['Quantifier-Input']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
      /** Group By */
      group_by?: string[];
      /** Measures */
      measures: components['schemas']['Measure-Input'][];
    };
    /**
     * Aggregate
     * @description Group the matching rows and measure each group.
     *
     *     ``group_by`` paths must be scalar, so the number of groups is bounded by the values
     *     a column holds rather than by an explosion over a repeated level.
     *
     *     Each ``group_by`` path is one column of the result, named by the whole path as
     *     written, and each measure is one named by its ``name``. No two may share a name,
     *     whatever their case.
     *
     *     ``over`` changes what a row is. Without it the rows are reactions, and "how many
     *     reactions are automated" is a count of them. With it the rows are the elements of
     *     one repeated level, which is what "the most common solvent" asks for: solvents are
     *     not a column of a reaction, and no grouping of reactions can name one. Paths inside
     *     are then relative to the element, as they are inside a quantifier.
     *
     *     Two filters, because there are two things to filter. This ``where`` selects the
     *     elements grouped -- the components that are solvents. The *query's* ``where``
     *     selects reactions, and says which reactions' elements are counted at all. "The most
     *     common solvents in reactions run above 350 K" needs both, and neither can say what
     *     the other says.
     *
     *     One level, never nested, so the rows are that level's own cardinality rather than a
     *     product: the query stays one pass and a sort, over the pivot instead of over the
     *     projection. ``reaction_id`` is reachable as a measure path and is how a question
     *     about reactions is answered from a relation of elements -- a reaction using THF
     *     twice is one reaction and two rows.
     */
    'Aggregate-Output': {
      /** Over */
      over?: string | null;
      /** Where */
      where?:
        | (
            | components['schemas']['And-Output']
            | components['schemas']['Or-Output']
            | components['schemas']['Not-Output']
            | components['schemas']['Quantifier-Output']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
      /** Group By */
      group_by?: string[];
      /** Measures */
      measures: components['schemas']['Measure-Output'][];
    };
    /**
     * And
     * @description Every clause holds.
     */
    'And-Input': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'and';
      /** Clauses */
      clauses: (
        | components['schemas']['And-Input']
        | components['schemas']['Or-Input']
        | components['schemas']['Not-Input']
        | components['schemas']['Quantifier-Input']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts']
      )[];
    };
    /**
     * And
     * @description Every clause holds.
     */
    'And-Output': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'and';
      /** Clauses */
      clauses: (
        | components['schemas']['And-Output']
        | components['schemas']['Or-Output']
        | components['schemas']['Not-Output']
        | components['schemas']['Quantifier-Output']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts']
      )[];
    };
    /**
     * AskRequest
     * @description A question in English, with any structures it names by placeholder.
     */
    AskRequest: {
      /** Question */
      question: string;
      /** Structures */
      structures?: {
        [key: string]: string;
      };
    };
    /**
     * AskResponse
     * @description The query a question became, a sentence about what it found, and the result.
     */
    AskResponse: {
      query: components['schemas']['Query-Output'];
      /** Text */
      text: string;
      /** Result */
      result:
        | components['schemas']['ReactionsResult']
        | components['schemas']['TableResult'];
    };
    /**
     * AuthenticStandardMolblock
     * @description A measurement's authentic standard.
     */
    AuthenticStandardMolblock: {
      /** Molblock */
      molblock: string | null;
    };
    /**
     * Comparison
     * @description A leaf compared against a literal.
     *
     *     A compound is never a comparison's value. What a resolved name could be compared
     *     against is a ``smiles``, and equal spellings are not what makes two compounds the
     *     same; ``same_compound`` is that question.
     */
    Comparison: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op:
        | 'contains'
        | 'ends_with'
        | 'eq'
        | 'ge'
        | 'gt'
        | 'le'
        | 'lt'
        | 'ne'
        | 'starts_with';
      /** Path */
      path: string;
      value: components['schemas']['Value'];
    };
    /**
     * CompoundCount
     * @description How often one compound appears in a dataset, with a molblock to draw it.
     */
    CompoundCount: {
      /** Smiles */
      smiles: string;
      /** Molblock */
      molblock: string | null;
      /** Count */
      count: number;
    };
    /**
     * DatasetSummary
     * @description One dataset in the corpus, from its source file's footer.
     */
    DatasetSummary: {
      /** Dataset Id */
      dataset_id: string;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /** Reactions */
      reactions: number;
    };
    /**
     * DownloadRequest
     * @description The reactions to download: at most one search's worth.
     */
    DownloadRequest: {
      /** Reaction Ids */
      reaction_ids: string[];
    };
    /**
     * ErrorDetail
     * @description The body of an error a route raises itself: a message.
     */
    ErrorDetail: {
      /** Detail */
      detail: string;
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components['schemas']['ValidationError'][];
    };
    /**
     * Health
     * @description The corpus the process serves.
     */
    Health: {
      /** Fingerprint */
      fingerprint: string;
    };
    /**
     * Measure
     * @description One aggregate over the matching rows.
     */
    'Measure-Input': {
      /**
       * Fn
       * @enum {string}
       */
      fn: 'count' | 'count_distinct' | 'sum' | 'avg' | 'min' | 'max';
      /** Path */
      path?: string | components['schemas']['Reduction-Input'] | null;
      /** Name */
      name: string;
    };
    /**
     * Measure
     * @description One aggregate over the matching rows.
     */
    'Measure-Output': {
      /**
       * Fn
       * @enum {string}
       */
      fn: 'count' | 'count_distinct' | 'sum' | 'avg' | 'min' | 'max';
      /** Path */
      path?: string | components['schemas']['Reduction-Output'] | null;
      /** Name */
      name: string;
    };
    /**
     * MeasurementMolblocks
     * @description The structures one product measurement names.
     */
    MeasurementMolblocks: {
      authentic_standard: components['schemas']['AuthenticStandardMolblock'];
    };
    /**
     * NewestDataset
     * @description The dataset that most recently reached ord-data.
     */
    NewestDataset: {
      /** Dataset Id */
      dataset_id: string;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /** Reactions */
      reactions: number;
      /**
       * Arrived
       * Format: date
       */
      arrived: string;
    };
    /**
     * Not
     * @description The clause does not hold.
     */
    'Not-Input': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'not';
      /** Clause */
      clause:
        | components['schemas']['And-Input']
        | components['schemas']['Or-Input']
        | components['schemas']['Not-Input']
        | components['schemas']['Quantifier-Input']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts'];
    };
    /**
     * Not
     * @description The clause does not hold.
     */
    'Not-Output': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'not';
      /** Clause */
      clause:
        | components['schemas']['And-Output']
        | components['schemas']['Or-Output']
        | components['schemas']['Not-Output']
        | components['schemas']['Quantifier-Output']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts'];
    };
    /**
     * NullCheck
     * @description Whether the source recorded the leaf at all.
     */
    NullCheck: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'is_null' | 'not_null';
      /** Path */
      path: string;
    };
    /**
     * Or
     * @description At least one clause holds.
     */
    'Or-Input': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'or';
      /** Clauses */
      clauses: (
        | components['schemas']['And-Input']
        | components['schemas']['Or-Input']
        | components['schemas']['Not-Input']
        | components['schemas']['Quantifier-Input']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts']
      )[];
    };
    /**
     * Or
     * @description At least one clause holds.
     */
    'Or-Output': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'or';
      /** Clauses */
      clauses: (
        | components['schemas']['And-Output']
        | components['schemas']['Or-Output']
        | components['schemas']['Not-Output']
        | components['schemas']['Quantifier-Output']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts']
      )[];
    };
    /**
     * Order
     * @description How to sort the result.
     */
    'Order-Input': {
      /** Key */
      key: string | components['schemas']['Reduction-Input'];
      /**
       * Descending
       * @default false
       */
      descending?: boolean;
    };
    /**
     * Order
     * @description How to sort the result.
     */
    'Order-Output': {
      /** Key */
      key: string | components['schemas']['Reduction-Output'];
      /**
       * Descending
       * @default false
       */
      descending?: boolean;
    };
    /**
     * OutcomeMolblocks
     * @description One outcome's products.
     */
    OutcomeMolblocks: {
      /** Products */
      products: components['schemas']['ProductMolblocks'][];
    };
    /**
     * ProductMolblocks
     * @description One product and its measurements' standards.
     */
    ProductMolblocks: {
      /** Molblock */
      molblock: string | null;
      /** Measurements */
      measurements: components['schemas']['MeasurementMolblocks'][];
    };
    /**
     * Quantifier
     * @description Some, or every, element at a repeated level satisfies ``where``.
     *
     *     Paths inside ``where`` are relative to the element bound here, which is what lets a
     *     single component be required to satisfy several conditions at once.
     */
    'Quantifier-Input': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'exists' | 'forall';
      /** Path */
      path: string;
      /** Where */
      where:
        | components['schemas']['And-Input']
        | components['schemas']['Or-Input']
        | components['schemas']['Not-Input']
        | components['schemas']['Quantifier-Input']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts'];
    };
    /**
     * Quantifier
     * @description Some, or every, element at a repeated level satisfies ``where``.
     *
     *     Paths inside ``where`` are relative to the element bound here, which is what lets a
     *     single component be required to satisfy several conditions at once.
     */
    'Quantifier-Output': {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'exists' | 'forall';
      /** Path */
      path: string;
      /** Where */
      where:
        | components['schemas']['And-Output']
        | components['schemas']['Or-Output']
        | components['schemas']['Not-Output']
        | components['schemas']['Quantifier-Output']
        | components['schemas']['Comparison']
        | components['schemas']['NullCheck']
        | components['schemas']['Substructure']
        | components['schemas']['Similarity']
        | components['schemas']['SameCompound']
        | components['schemas']['SameParent']
        | components['schemas']['ReactionSmarts'];
    };
    /**
     * Query
     * @description A whole query: which reactions, optionally grouped and measured.
     */
    'Query-Input': {
      /** Where */
      where?:
        | (
            | components['schemas']['And-Input']
            | components['schemas']['Or-Input']
            | components['schemas']['Not-Input']
            | components['schemas']['Quantifier-Input']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
      aggregate?: components['schemas']['Aggregate-Input'] | null;
      /** Order By */
      order_by?: components['schemas']['Order-Input'][];
      /** Limit */
      limit?: number | null;
    };
    /**
     * Query
     * @description A whole query: which reactions, optionally grouped and measured.
     */
    'Query-Output': {
      /** Where */
      where?:
        | (
            | components['schemas']['And-Output']
            | components['schemas']['Or-Output']
            | components['schemas']['Not-Output']
            | components['schemas']['Quantifier-Output']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
      aggregate?: components['schemas']['Aggregate-Output'] | null;
      /** Order By */
      order_by?: components['schemas']['Order-Output'][];
      /** Limit */
      limit?: number | null;
    };
    /**
     * ReactionMolblocks
     * @description A molblock for each compound slot of a reaction; None where none reads.
     */
    ReactionMolblocks: {
      /** Inputs */
      inputs: {
        [key: string]: (string | null)[];
      };
      /** Outcomes */
      outcomes: components['schemas']['OutcomeMolblocks'][];
      /** Workups */
      workups: (string | null)[][];
    };
    /**
     * ReactionRecord
     * @description One reaction as the editor returns it: the serialized proto and molblocks.
     */
    ReactionRecord: {
      /** Reaction Id */
      reaction_id: string;
      /** Dataset Id */
      dataset_id: string | null;
      /** Binpb */
      binpb: string;
      molblocks: components['schemas']['ReactionMolblocks'];
    };
    /**
     * ReactionSmarts
     * @description The reaction matches a reaction SMARTS, each template on a molecule of its own.
     *
     *     Each reactant template has to match an input component whose role is ``REACTANT``,
     *     each product template a product, and each agent template an input component in any
     *     other role. Every template has to match, and two templates on one side have to
     *     match two different molecules: ``C(=O)O.N`` names an acid and an amine, and a
     *     Boc-protected amine holding both groups is not that, even recorded twice. Grouping
     *     with parentheses, ``(C(=O)O.N)``, makes one template of both pieces, matched within
     *     one molecule. The RDKit cartridge's ``@>`` accepts any one template per side, which
     *     for a two-template query returns several times the reactions the query describes.
     *     Atom maps are ignored, as ``@>`` ignores them, so this says which molecules took
     *     part and not which atoms changed. ``chirality`` applies to every template, as it
     *     does to a ``substructure``.
     */
    ReactionSmarts: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'reaction_smarts';
      /** Smarts */
      smarts: string;
      /**
       * Chirality
       * @default true
       */
      chirality?: boolean;
    };
    /**
     * ReactionsResult
     * @description A plain query's answer: reaction IDs to fetch a page at a time.
     */
    ReactionsResult: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      kind: 'reactions';
      /**
       * Reaction Ids
       * @description The IDs of the matching reactions, at most 1,000
       */
      reaction_ids: string[];
      /**
       * Truncated
       * @description True when the corpus's bound of 1,000 rows may have cut the answer short
       */
      truncated: boolean;
    };
    /**
     * Reduction
     * @description One value per reaction, reduced from a path that crosses a repeated level.
     *
     *     An ordering key and an aggregate's argument both have to be scalar, which leaves
     *     "the highest-yielding reactions" unwritable: a yield lives under outcomes, products,
     *     and measurements, so the path resolves to a list rather than a number. This reduces
     *     that list to the one value the reaction is judged by, leaving the aggregate to
     *     combine those across reactions.
     *
     *     ``where`` selects which elements are reduced, and is what separates "the highest
     *     yield" from "the highest percentage anything was measured at": a percentage is
     *     recorded for selectivity and purity too, so a reduction over the bare path answers
     *     a broader question than the one asked. Its paths are relative to the element, as
     *     they are inside a quantifier, and the element is the deepest repeated level the
     *     path crosses -- for
     *     ``outcomes.products.measurements.percentage.value`` that is a measurement, so
     *     ``type`` there means the measurement's own.
     *
     *     Attributes:
     *         reduce: How to reduce the list. ``count`` counts the values that are present.
     *         path: A dotted path crossing at least one repeated level.
     *         where: Selects the elements to reduce; all of them when absent.
     */
    'Reduction-Input': {
      /**
       * Reduce
       * @enum {string}
       */
      reduce: 'min' | 'max' | 'avg' | 'sum' | 'count';
      /** Path */
      path: string;
      /** Where */
      where?:
        | (
            | components['schemas']['And-Input']
            | components['schemas']['Or-Input']
            | components['schemas']['Not-Input']
            | components['schemas']['Quantifier-Input']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
    };
    /**
     * Reduction
     * @description One value per reaction, reduced from a path that crosses a repeated level.
     *
     *     An ordering key and an aggregate's argument both have to be scalar, which leaves
     *     "the highest-yielding reactions" unwritable: a yield lives under outcomes, products,
     *     and measurements, so the path resolves to a list rather than a number. This reduces
     *     that list to the one value the reaction is judged by, leaving the aggregate to
     *     combine those across reactions.
     *
     *     ``where`` selects which elements are reduced, and is what separates "the highest
     *     yield" from "the highest percentage anything was measured at": a percentage is
     *     recorded for selectivity and purity too, so a reduction over the bare path answers
     *     a broader question than the one asked. Its paths are relative to the element, as
     *     they are inside a quantifier, and the element is the deepest repeated level the
     *     path crosses -- for
     *     ``outcomes.products.measurements.percentage.value`` that is a measurement, so
     *     ``type`` there means the measurement's own.
     *
     *     Attributes:
     *         reduce: How to reduce the list. ``count`` counts the values that are present.
     *         path: A dotted path crossing at least one repeated level.
     *         where: Selects the elements to reduce; all of them when absent.
     */
    'Reduction-Output': {
      /**
       * Reduce
       * @enum {string}
       */
      reduce: 'min' | 'max' | 'avg' | 'sum' | 'count';
      /** Path */
      path: string;
      /** Where */
      where?:
        | (
            | components['schemas']['And-Output']
            | components['schemas']['Or-Output']
            | components['schemas']['Not-Output']
            | components['schemas']['Quantifier-Output']
            | components['schemas']['Comparison']
            | components['schemas']['NullCheck']
            | components['schemas']['Substructure']
            | components['schemas']['Similarity']
            | components['schemas']['SameCompound']
            | components['schemas']['SameParent']
            | components['schemas']['ReactionSmarts']
          )
        | null;
    };
    /**
     * SameCompound
     * @description The element's structure is the same compound, however either was drawn.
     *
     *     An ``eq`` on a ``smiles`` compares spellings, and two drawings of one reagent are
     *     unequal: acetic acid and acetate, an amine and its ammonium, a 2-pyridone and its
     *     2-hydroxypyridine tautomer. This compares the ``mol_hash`` the structures artifact
     *     derives, which ignores protonation state, tautomer, and atom-map labels, so those
     *     match. Fragments and stereochemistry are not ignored: sodium acetate stays distinct
     *     from acetic acid, and enantiomers from each other.
     *
     *     ``path`` names a compound's ``smiles``. The query is a SMILES, or a compound name
     *     resolved at execution; exactly one is given.
     */
    SameCompound: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'same_compound';
      /** Path */
      path: string;
      /** Smiles */
      smiles?: string | null;
      /** Compound */
      compound?: string | null;
    };
    /**
     * SameParent
     * @description The element's structure is the same compound once counterions are set aside.
     *
     *     What ``same_compound`` ignores, this ignores too, and the salt a reagent was sold
     *     as besides: sodium acetate matches acetic acid, and triethylamine hydrochloride
     *     matches triethylamine. Reagents whose parents differ still differ, so sodium
     *     carbonate does not match sodium acetate; reagents that *are* the salt are left
     *     whole, so sodium hydride does not match hydrogen and palladium acetate does not
     *     match acetic acid.
     *
     *     It is the looser question of the two, and the looseness is the point: sodium and
     *     potassium carbonate share a parent and match here, which is right for "which
     *     reactions used carbonate" and wrong for a question about the sodium. Ask
     *     ``same_compound`` for that one.
     *
     *     Only the counterions RDKit recognizes are set aside -- the halides, lithium,
     *     sodium, potassium, calcium, magnesium, and the usual acid counterions. A salt of
     *     something else, cesium carbonate among them, is left whole and matches only itself.
     *
     *     ``path`` names a compound's ``smiles``. The query is a SMILES, or a compound name
     *     resolved at execution; exactly one is given.
     */
    SameParent: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'same_parent';
      /** Path */
      path: string;
      /** Smiles */
      smiles?: string | null;
      /** Compound */
      compound?: string | null;
    };
    /**
     * SearchRequest
     * @description One query in the search grammar, as the form and /ask both produce.
     */
    SearchRequest: {
      query: components['schemas']['Query-Input'];
    };
    /**
     * Similarity
     * @description The element's structure is Tanimoto-similar to the query molecule.
     *
     *     Similarity is defined on the Morgan fingerprints in the structures artifact, so
     *     the screen is the whole answer and no verification step exists. ``path`` names a
     *     compound's ``smiles``. The query is a SMILES, or a compound name resolved at
     *     execution; exactly one is given.
     */
    Similarity: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'similarity';
      /** Path */
      path: string;
      /** Smiles */
      smiles?: string | null;
      /** Compound */
      compound?: string | null;
      /** Threshold */
      threshold: number;
    };
    /**
     * Substructure
     * @description The element's structure contains the query as a subgraph.
     *
     *     ``path`` names a compound's ``smiles``. The query is a SMARTS pattern, or a
     *     compound name resolved to a molecule at execution; exactly one is given.
     *
     *     A stereocenter drawn in the query is respected, as RDKit respects it: a pattern
     *     drawn as one enantiomer matches that enantiomer, not its mirror image or the same
     *     molecule recorded without stereo. ``chirality`` false ignores stereocenters, for a
     *     question about the molecule whatever its configuration. A query with no
     *     stereocenters matches the same structures either way.
     *
     *     CXSMILES stereo groups count too. A structure recorded as a racemate (``&``) or as
     *     an unknown single enantiomer (``o``) matches a pattern drawn as either enantiomer,
     *     and a pattern drawn as a racemate matches only racemates.
     */
    Substructure: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      op: 'substructure';
      /** Path */
      path: string;
      /** Smarts */
      smarts?: string | null;
      /** Compound */
      compound?: string | null;
      /**
       * Chirality
       * @default true
       */
      chirality?: boolean;
    };
    /**
     * TableResult
     * @description An aggregate's answer: its group and measure columns; bytes cells are base64.
     */
    TableResult: {
      /**
       * @description discriminator enum property added by openapi-typescript
       * @enum {string}
       */
      kind: 'table';
      /** Columns */
      columns: string[];
      /**
       * Rows
       * @description One row per group, with a cell for each column in order; at most 1,000
       */
      rows: unknown[][];
      /**
       * Truncated
       * @description True when the corpus's bound of 1,000 rows may have cut the answer short
       */
      truncated: boolean;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
      /** Input */
      input?: unknown;
      /** Context */
      ctx?: Record<string, never>;
    };
    /**
     * ValidationErrorItem
     * @description One way a request fails validation, as in FastAPI's own ValidationError.
     */
    ValidationErrorItem: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
      /** Input */
      input?: unknown;
      /** Context */
      ctx?: {
        [key: string]: unknown;
      } | null;
    };
    /**
     * ValidationErrors
     * @description The body FastAPI answers 422 with when the request fails validation.
     */
    ValidationErrors: {
      /** Detail */
      detail: components['schemas']['ValidationErrorItem'][];
    };
    /**
     * Value
     * @description A comparison operand: a literal, bound as a parameter of its own type.
     */
    Value: {
      /** Literal */
      literal: boolean | number | string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  health_api_health_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Health'];
        };
      };
    };
  };
  list_datasets_api_datasets_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DatasetSummary'][];
        };
      };
    };
  };
  newest_dataset_api_datasets_newest_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NewestDataset'] | null;
        };
      };
    };
  };
  get_dataset_api_datasets__dataset_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        dataset_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DatasetSummary'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  dataset_compounds_api_datasets__dataset_id__compounds_get: {
    parameters: {
      query?: {
        side?: 'inputs' | 'products';
        limit?: number;
      };
      header?: never;
      path: {
        dataset_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CompoundCount'][];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description The request fails validation (a list of errors), or the query does not compile or names an unknown compound (a message) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['ErrorDetail']
            | components['schemas']['ValidationErrors'];
        };
      };
      /** @description Every search slot stayed busy */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description The search ran past its timeout */
      504: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
    };
  };
  list_reactions_api_reactions_get: {
    parameters: {
      query: {
        id: string[];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReactionRecord'][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  get_reaction_api_reactions__reaction_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        reaction_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReactionRecord'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  download_api_download_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DownloadRequest'];
      };
    };
    responses: {
      /** @description A gzipped serialized ord.Dataset */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/gzip': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  search_api_search_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SearchRequest'];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['ReactionsResult']
            | components['schemas']['TableResult'];
        };
      };
      /** @description The request fails validation (a list of errors), or the query does not compile or names an unknown compound (a message) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['ErrorDetail']
            | components['schemas']['ValidationErrors'];
        };
      };
      /** @description Every search slot stayed busy */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description The search ran past its timeout */
      504: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
    };
  };
  ask_api_ask_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AskRequest'];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AskResponse'];
        };
      };
      /** @description The request fails validation (a list of errors), or the question cannot be put to the grammar, the model declined it, or its query names an unknown compound (a message) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['ErrorDetail']
            | components['schemas']['ValidationErrors'];
        };
      };
      /** @description The model is rate limiting the service */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description The model's query did not compile, and neither did its repair */
      502: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description Every search slot stayed busy, no API key is configured, or a call to the model failed */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
      /** @description The search ran past its timeout */
      504: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorDetail'];
        };
      };
    };
  };
}
