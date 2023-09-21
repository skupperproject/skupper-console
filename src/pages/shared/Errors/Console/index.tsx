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

import { ConsoleErrorLabels } from './Console.enum';
import ErrorHttp from '../Http';

interface ErrorProps {
  error: {
    stack?: string;
    message?: string;
    code?: string;
    httpStatus?: string;
  };
  resetErrorBoundary: (...args: unknown[]) => void;
}

const Error: FC<ErrorProps> = function ({ error, resetErrorBoundary }) {
  const { code, message, httpStatus } = error;

  if (httpStatus || code === 'ERR_NETWORK') {
    return <ErrorHttp code={code} message={message} onReset={resetErrorBoundary} />;
  }

  return (
    <PageSection variant={PageSectionVariants.light} data-testid="sk-js-error-view">
      <TextContent>
        <Title headingLevel="h1">{ConsoleErrorLabels.ErrorTitle}</Title>
        <Text component={TextVariants.h3}>{message || ''}</Text>

        <Divider />

        <ClipboardCopy isExpanded hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
          {error.stack}
        </ClipboardCopy>
      </TextContent>
    </PageSection>
  );
};

export default Error;
