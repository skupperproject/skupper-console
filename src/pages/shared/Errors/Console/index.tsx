import { FC } from 'react';

import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Divider,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';

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
    <PageSection variant={PageSectionVariants.light} data-testid="sk-js-error-view">
      <TextContent>
        <Title headingLevel="h1">{Labels.ErrorTitle}</Title>
        <Text component={TextVariants.h3}>{error.message || ''}</Text>

        <Divider />

        <ClipboardCopy isExpanded hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
          {error.stack}
        </ClipboardCopy>
      </TextContent>
    </PageSection>
  );
};

export default Console;
