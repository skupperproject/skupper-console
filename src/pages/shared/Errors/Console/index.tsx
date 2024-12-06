import { FC } from 'react';

import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Divider,
  PageSection,
  Content,
  ContentVariants,
  Title
} from '@patternfly/react-core';

import { ConsoleErrorLabels } from './Console.enum';
import ErrorHttp from '../Http';

interface ErrorConsoleProps {
  error: {
    stack?: string;
    message?: string;
    code?: string;
    httpStatus?: string;
  };
  resetErrorBoundary: (...args: unknown[]) => void;
}

const ErrorConsole: FC<ErrorConsoleProps> = function ({ error, resetErrorBoundary }) {
  const { code, message = '', httpStatus } = error;

  // It handles network errors
  if (httpStatus || code === 'ERR_NETWORK') {
    return <ErrorHttp code={code} message={message} onReset={resetErrorBoundary} />;
  }

  // It handles app errors
  return (
    <PageSection hasBodyWrapper={false} data-testid="sk-js-error-view">
      <Content>
        <Title headingLevel="h1">{ConsoleErrorLabels.ErrorTitle}</Title>
        <Content component={ContentVariants.h3}>{message}</Content>

        <Divider />

        <ClipboardCopy isExpanded hoverTip="Copy" clickTip="Copied" variant={ClipboardCopyVariant.expansion}>
          {error.stack || ''}
        </ClipboardCopy>
      </Content>
    </PageSection>
  );
};

export default ErrorConsole;
