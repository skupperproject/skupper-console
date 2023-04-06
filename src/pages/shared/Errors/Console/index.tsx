import React, { FC } from 'react';

import {
  Brand,
  ClipboardCopy,
  ClipboardCopyVariant,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

import BrandImg from '@assets/skupper.svg';

import { Labels } from './Console.enum';

interface ConsoleProps {
  error: {
    message?: string;
    stack?: string;
  };
  resetErrorBoundary: (...args: unknown[]) => void;
}

const Console: FC<ConsoleProps> = function ({ error }) {
  return (
    <Grid data-cy="sk-not-found" className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{Labels.ErrorConsoleTitle}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.h3}>{error.message || ''}</Text>
          <ClipboardCopy isExpanded hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
            {error.stack}
          </ClipboardCopy>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={BrandImg} alt="skupper brand" />
        <TextContent>
          <Text>{Labels.ErrorBrandMessage}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default Console;
