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
import { combineReducers, createReducer, isAnyOf, original } from '@reduxjs/toolkit';
import {
  createEmptyReactionActions,
  getReactionActions,
  getReactionPageActions,
  getReactionsListActions,
  importReactionFromFileActions,
  addUpdateReactionFieldActions,
  deleteReactionFieldActions,
  removeReactionActions,
  renameReactionActions,
  restoreSavedReaction,
  setShowInvalidOnly,
} from './reactions.actions.ts';
import {
  getAllTemplatesActions,
  removeTemplateActions,
  renameTemplateActions,
  addUpdateVariableActions,
  removeVariableActions,
  createNewTemplateActions,
  importTemplateFromFileActions,
  restoreSavedVariables,
} from 'store/entities/templates/templates.actions.ts';
import {
  itemsById,
  type AppReaction,
  type DatasetReaction,
  deepMergeWithArrayMerge,
  generateDeepPartialReactionByPath,
  removeDeepReactionPart,
  linkReactionEntities,
} from '@open-reaction-database/ui/reaction/model';
import type {
  ReactionOrTemplate,
  ReactionTemplate,
} from 'store/entities/reactions/reactionsStore.types.ts';
import type { ItemsById, Pagination } from 'common/types';
import { emptyPagination } from 'common/constants.ts';
import { reactionsPreviewsReducer } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.reducer.ts';
import type { Variable } from '../templates/templates.types.ts';

const getReactionId = (reaction: DatasetReaction) => reaction.id;

const getTemplateId = (template: ReactionTemplate) => template.id;

const getVariableId = (variable: Variable) => variable.path.join('.');

const activeDatasetId = createReducer<number>(0, builder => {
  builder.addCase(getReactionActions.request, (_, action) => action.payload.datasetId);
  builder.addCase(getReactionsListActions.request, (_, action) => action.payload);
});

const reactionsById = createReducer<ItemsById<ReactionOrTemplate>>({}, builder => {
  builder.addCase(
    addUpdateReactionFieldActions.request,
    (state, { payload: { reactionId, pathComponents, newValue } }) => {
      const reaction = state[reactionId];
      const updatedReaction: AppReaction = linkReactionEntities(
        deepMergeWithArrayMerge(
          reaction.data,
          generateDeepPartialReactionByPath(pathComponents, newValue),
        ),
      );
      return {
        ...state,
        [reactionId]: {
          ...reaction,
          // Snapshot the pre-edit data so the optimistic change can be rolled back if the backend
          // rejects it; keep the earliest baseline if several edits queue up. (#615)
          dataBeforeEdit: reaction.dataBeforeEdit ?? reaction.data,
          data: updatedReaction,
        },
      };
    },
  );
  builder.addCase(
    deleteReactionFieldActions.request,
    (state, { payload: { reactionId, pathComponents } }) => {
      const reaction = state[reactionId];
      const updatedReaction: AppReaction = linkReactionEntities(
        removeDeepReactionPart(reaction.data, pathComponents),
      );
      return {
        ...state,
        [reactionId]: {
          ...reaction,
          // Snapshot the pre-edit data so the optimistic change can be rolled back if the backend
          // rejects it; keep the earliest baseline if several edits queue up. (#615)
          dataBeforeEdit: reaction.dataBeforeEdit ?? reaction.data,
          data: updatedReaction,
        },
      };
    },
  );
  builder.addCase(removeReactionActions.success, (state, { payload: reactionId }) => {
    const { [reactionId]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(removeTemplateActions.success, (state, { payload: templateId }) => {
    const { [`template_${templateId}`]: _, ...rest } = state;
    return rest;
  });
  builder.addCase(getAllTemplatesActions.success, (state, action) => ({
    ...state,
    ...itemsById(
      action.payload.map(item => ({ ...item, data: linkReactionEntities(item.data) })),
      getTemplateId,
    ),
  }));
  builder.addCase(renameTemplateActions.success, (state, action) => {
    return {
      ...state,
      [action.payload.id]: action.payload,
    };
  });
  builder.addCase(
    addUpdateVariableActions.request,
    (state, { payload: { templateId, variable } }) => {
      const template = state[templateId] as ReactionTemplate;
      return {
        ...state,
        [templateId]: {
          ...template,
          variablesBeforeEdit: template.variablesBeforeEdit ?? template.variables,
          variables: {
            ...template.variables,
            [getVariableId(variable)]: variable,
          },
        },
      };
    },
  );
  builder.addCase(
    removeVariableActions.request,
    (state, { payload: { templateId, variable } }) => {
      const template = state[templateId] as ReactionTemplate;
      const { [getVariableId(variable)]: _, ...variables } = template.variables;

      return {
        ...state,
        [templateId]: {
          ...template,
          variablesBeforeEdit: template.variablesBeforeEdit ?? template.variables,
          variables,
        },
      };
    },
  );
  builder.addCase(restoreSavedReaction, (state, { payload: reactionId }) => {
    // A save failed (e.g. role changed to viewer, or the backend is down): show the data the
    // backend holds, dropping every unsaved edit. Later saves then find nothing to send. (#615)
    const reaction = state[reactionId];
    if (reaction?.dataBeforeEdit === undefined) {
      return state;
    }
    return {
      ...state,
      [reactionId]: {
        ...reaction,
        data: reaction.dataBeforeEdit,
        dataBeforeEdit: undefined,
      },
    };
  });
  builder.addCase(restoreSavedVariables, (state, { payload: templateId }) => {
    const template = state[templateId] as ReactionTemplate | undefined;
    if (template?.variablesBeforeEdit === undefined) {
      return state;
    }
    const { variablesBeforeEdit, ...rest } = template;
    return { ...state, [templateId]: { ...rest, variables: variablesBeforeEdit } };
  });
  builder.addCase(
    renameReactionActions.success,
    (state, { payload: { reactionId, name, savedData } }) => {
      // The state is an Immer draft: compare the stored data, not its proxy, with what was sent.
      const stored = original(state)![reactionId];
      if (stored === undefined) {
        return state;
      }
      const reaction = state[reactionId];
      return {
        ...state,
        [reactionId]: {
          ...reaction,
          pb_reaction_id: name,
          data: { ...reaction.data, reactionId: name },
          // The backend now holds the data the rename sent, under the new name. Edits made since
          // stay unsaved, and a failed save of them rolls back to it. (#615)
          dataBeforeEdit:
            stored.data === savedData ? undefined : { ...savedData, reactionId: name },
        },
      };
    },
  );
  builder.addMatcher(
    isAnyOf(addUpdateVariableActions.success, removeVariableActions.success),
    (state, { payload: { templateId, savedVariables } }) => {
      // The state is an Immer draft: compare the stored variables, not their proxy.
      const template = original(state)![templateId] as ReactionTemplate | undefined;
      if (template === undefined) {
        return state;
      }
      // The backend now holds the variables this save sent; edits made since stay unsaved.
      return {
        ...state,
        [templateId]: {
          ...template,
          variablesBeforeEdit:
            template.variables === savedVariables ? undefined : savedVariables,
        },
      };
    },
  );
  builder.addMatcher(
    isAnyOf(createNewTemplateActions.success, importTemplateFromFileActions.success),
    (state, action) => ({
      ...state,
      [getTemplateId(action.payload)]: {
        ...action.payload,
        data: linkReactionEntities(action.payload.data),
      },
    }),
  );
  builder.addMatcher(
    isAnyOf(addUpdateReactionFieldActions.success, deleteReactionFieldActions.success),
    (state, { payload: { savedData, ...payload } }) => {
      const { id } = payload;
      // The state is an Immer draft: compare the stored data, not its proxy, with what was sent.
      const stored = original(state)![id];
      if (stored === undefined) {
        return state;
      }
      const { data } = stored;
      // The backend now holds the data this save sent. Edits made since stay unsaved, and a failed
      // save of them rolls back to it. (#615)
      return {
        ...state,
        [id]: {
          ...payload,
          data,
          dataBeforeEdit: data === savedData ? undefined : savedData,
        },
      };
    },
  );
  builder.addMatcher(
    isAnyOf(
      getReactionActions.success,
      createEmptyReactionActions.success,
      importReactionFromFileActions.success,
    ),
    (state, action) => ({
      ...state,
      [getReactionId(action.payload)]: {
        ...action.payload,
        data: linkReactionEntities(action.payload.data),
      },
    }),
  );
  builder.addMatcher(
    isAnyOf(getReactionsListActions.success, getReactionPageActions.success),
    (state, action) => ({
      ...state,
      ...itemsById(
        action.payload.items.map(item => ({
          ...item,
          data: linkReactionEntities(item.data),
        })),
        getReactionId,
      ),
    }),
  );
});

const reactionsOrder = createReducer<Array<number>>([], builder => {
  builder.addCase(getReactionsListActions.request, () => []);
  builder.addCase(removeReactionActions.success, (state, { payload: reactionId }) =>
    state.filter(id => id !== reactionId),
  );
  builder.addMatcher(
    isAnyOf(getReactionsListActions.request, getReactionPageActions.request),
    () => [],
  );
  builder.addMatcher(
    isAnyOf(getReactionsListActions.success, getReactionPageActions.success),
    (_, action) => action.payload.items.map(getReactionId),
  );
});

const pagination = createReducer<Pagination>(emptyPagination, builder => {
  builder.addCase(getReactionsListActions.request, () => emptyPagination);
  builder.addCase(getReactionPageActions.request, (state, action) => ({
    ...state,
    ...action.payload,
  }));
  builder.addMatcher(
    isAnyOf(getReactionsListActions.success, getReactionPageActions.success),
    (state, action) => ({
      ...state,
      total: action.payload.total,
      pages: action.payload.pages,
    }),
  );
  builder.addMatcher(
    isAnyOf(createEmptyReactionActions.success, importReactionFromFileActions.success),
    state => ({
      ...state,
      total: state.total + 1,
      pages: Math.ceil((state.total + 1) / state.size),
    }),
  );
  builder.addMatcher(isAnyOf(removeReactionActions.success), state => ({
    ...state,
    total: state.total - 1,
    pages: Math.ceil((state.total - 1) / state.size),
  }));
});

const isReactionCreating = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(createEmptyReactionActions.request, importReactionFromFileActions.request),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      createEmptyReactionActions.success,
      createEmptyReactionActions.failure,
      importReactionFromFileActions.success,
      importReactionFromFileActions.failure,
    ),
    () => false,
  );
});

const areReactionsLoading = createReducer<boolean>(false, builder => {
  builder.addMatcher(
    isAnyOf(getReactionsListActions.request, getReactionPageActions.request),
    () => true,
  );
  builder.addMatcher(
    isAnyOf(
      getReactionsListActions.success,
      getReactionsListActions.failure,
      getReactionPageActions.success,
      getReactionPageActions.failure,
    ),
    () => false,
  );
});

const showInvalidOnly = createReducer<boolean>(false, builder => {
  builder.addCase(setShowInvalidOnly, (_, action) => action.payload);
  // Reset to the default (show all) whenever a dataset's reactions load — on open, refresh, or
  // switching datasets — so the filter is scoped per dataset rather than persisting globally,
  // mirroring the Tabs/List view toggle. The in-list toggle refetches via getReactionsPage, so it
  // doesn't trip this reset. (#591)
  builder.addCase(getReactionsListActions.request, () => false);
});

export const reactionsReducer = combineReducers({
  reactionsById,
  reactionsOrder,
  pagination,
  activeDatasetId,
  isReactionCreating,
  areReactionsLoading,
  showInvalidOnly,
  reactionsPreviews: reactionsPreviewsReducer,
});
