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
import type { ReactionWrapper } from 'store/entities/reactions/reactions.types.ts';
import { Fragment, useMemo } from 'react';
import { renderSvg } from 'common/utils/indigo.ts';
import type { ord } from 'ord-schema-protobufjs';
import type { ReactionInputPreview, ReactionProductPreview } from './reactionPreview.types.ts';
import classes from './reactionPreview.module.scss';
import { Flex } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectOrderedInputsWrapper } from 'store/entities/reactions/reactions.selectors.ts';

interface ReactionPreviewProps {
  reaction: ReactionWrapper;
}

function ReactionProduct({ svg }: Readonly<ReactionProductPreview>) {
  return (
    svg && (
      <img
        src={`data:image/svg+xml;base64,${svg}`}
        className={classes.molecule}
      />
    )
  );
}

function ReactionInput({ name, components }: Readonly<ReactionInputPreview>) {
  return (
    <div className={classes.inputCard}>
      <span>{name}</span>
      <Flex
        gap="sm"
        flex={1}
        align="center"
        mt="xs"
      >
        {components.map(({ svg }, index) =>
          svg ? (
            <img
              src={`data:image/svg+xml;base64,${svg}`}
              key={index}
              className={classes.molecule}
            />
          ) : null,
        )}
      </Flex>
    </div>
  );
}

export function ReactionPreview({ reaction }: Readonly<ReactionPreviewProps>) {
  const inputs = useSelector(selectOrderedInputsWrapper(reaction.id));

  const inputsPreview: Array<ReactionInputPreview> = useMemo(() => {
    return inputs.map(
      (input): ReactionInputPreview => ({
        name: input.name,
        components: (input.components || []).map((component, index) => ({
          component,
          svg: reaction.molblocks.inputs[input.name] ? renderSvg(reaction.molblocks.inputs[input.name][index]) : null,
        })),
      }),
    );
  }, [inputs, reaction.molblocks.inputs]);

  const products = useMemo(() => {
    return reaction.molblocks.products.map(
      (molecule, index): ReactionProductPreview => ({
        product: (reaction.data.outcomes || [])[index] as ord.IReactionOutcome,
        svg: molecule ? renderSvg(molecule) : null,
      }),
    );
  }, [reaction.molblocks.products, reaction.data.outcomes]);

  return (
    <div className={classes.wrapper}>
      {inputsPreview.map((molecule, index) => (
        <Fragment key={molecule.name}>
          {index > 0 && index < inputs.length && <span className={classes.plus}>+</span>}
          <ReactionInput
            name={molecule.name}
            components={molecule.components}
          />
        </Fragment>
      ))}
      <span className={classes.arrow}>⟶</span>
      {products.map((molecule, index) => (
        <ReactionProduct
          key={index}
          product={molecule.product}
          svg={molecule.svg}
        />
      ))}
    </div>
  );
}
