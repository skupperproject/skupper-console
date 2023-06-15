import { FC } from 'react';

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

import { brandImg } from '@config/config';

import { Labels } from './Console.enum';
import { ErrorLabels } from '../Errors.enum';

interface ConsoleProps {
  error: {
    message?: string;
    stack?: string;
  };
  resetErrorBoundary: (...args: unknown[]) => void;
}

const Console: FC<ConsoleProps> = function ({ error }) {
  return (
    <Grid data-testid="sk-js-error-view" className=" pf-u-p-4xl">
      <GridItem span={6} className=" pf-u-p-2xl">
        <TextContent className="pf-u-text-align-center pf-u-mb-4xl">
          <Text component={TextVariants.h1}>{Labels.ErrorTitle}</Text>
        </TextContent>
        <TextContent>
          <Text component={TextVariants.h3}>{error.message || ''}</Text>
          <ClipboardCopy isExpanded hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
            {error.stack}
          </ClipboardCopy>
        </TextContent>
      </GridItem>
      <GridItem span={6} className=" pf-u-p-2xl">
        <Brand src={brandImg} alt="brand" />
        <TextContent>
          <Text>{ErrorLabels.Description}</Text>
        </TextContent>
      </GridItem>
    </Grid>
  );
};

export default Console;
