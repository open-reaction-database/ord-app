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
import { createNewTemplateActions, getTemplateActions } from './templates.actions.ts';
import type { Template, TemplateWrapper } from './templates.types.ts';
import { createThunk, createThunkWithExplicitResult } from 'store/utils';
import axiosInstance from 'store/axiosInstance.ts';
import { ordReactionToReaction, reactionToOrdReaction } from '../reactions/reactions.converters.ts';
import { navigate } from 'wouter/use-browser-location';
import { ord } from 'ord-schema-protobufjs';
import { Buffer } from 'buffer';
import { selectReactionById } from '../reactions/reactions.selectors.ts';
import type { AppReaction, ReactionMolBlocks } from '../reactions/reactions.types.ts';
import type { AppReactionInput } from 'store/entities/reactions/reactionsInputs/reactionInputs.types.ts';
import type { PreviewsById } from 'store/entities/reactions/reactionsPreviews/reactionsPreviews.types.ts';

const getTemplatePreviews = (reaction: AppReaction, molblocks: ReactionMolBlocks): PreviewsById => {
  const inputsArray = Object.values(reaction.inputs);
  const inputsPreviews: PreviewsById = Object.entries(molblocks.inputs).reduce(
    (acc: PreviewsById, [inputName, input]) => ({
      ...acc,
      ...input.reduce((acc: PreviewsById, item, index) => {
        const component = (inputsArray.find(item => item.name === inputName) as AppReactionInput).components[index];
        return {
          ...acc,
          [component.id]: item,
        };
      }, {}),
    }),
    {},
  );

  const outcomesPreviews: PreviewsById = molblocks.outcomes.reduce(
    (acc: PreviewsById, products, outcomeIndex) => ({
      ...acc,
      ...products.reduce((acc: PreviewsById, item, productIndex) => {
        const product = reaction.outcomes[outcomeIndex].products[productIndex];
        return {
          ...acc,
          [product.id]: item,
        };
      }, {}),
    }),
    {},
  );
  return { ...inputsPreviews, ...outcomesPreviews };
};

const parseTemplate = ({ binpb, ...rest }: Template): TemplateWrapper => {
  const decodedBinpb = Buffer.from(binpb, 'base64').toString('utf-8');
  const parsedProtobuf = ord.Reaction.decode(Buffer.from(decodedBinpb, 'base64'));
  const appReaction = ordReactionToReaction(ord.Reaction.toObject(parsedProtobuf));
  // TODO: addapt this to Template structure
  const previews = getTemplatePreviews(appReaction, { inputs: {}, outcomes: [] });

  return {
    ...rest,
    previews,
    data: appReaction,
  };
};

export const getTemplate = createThunk(getTemplateActions, async (_d, _s, { templateId }) => {
  const result = await axiosInstance.get<Template>(`/templates/${templateId}`);
  // console.log('result', result);
  const template = parseTemplate(result.data);
  // console.log('template', template);
  return getTemplateActions.success(template);
});

export const createTemplate = createThunkWithExplicitResult(
  createNewTemplateActions,
  async (dispatch, getState, { ...templateLoad }) => {
    const reaction = selectReactionById(templateLoad.reactionId)(getState());
    const ordReaction = reactionToOrdReaction(reaction.data);
    const binpb = Buffer.from(ord.Reaction.encode(ordReaction).finish()).toString('base64');
    const payload = {
      name: templateLoad.name,
      binpb: binpb,
      variables: '[]',
    };
    const template = (await axiosInstance.post<Template>(`/templates`, payload)).data;
    dispatch(createNewTemplateActions.success(template));
    navigate(`/templates/${template.id}`);
  },
);
