import React from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

interface AppContentProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

const AppContent = function ({ header, children }: AppContentProps) {
  return (
    <Stack>
      {header && <StackItem className="pf-u-px-md pf-u-py-md">{header}</StackItem>}
      <StackItem className="pf-u-px-md pf-u-py-md" isFilled>
        {children}
      </StackItem>
    </Stack>
  );
};

export default AppContent;
