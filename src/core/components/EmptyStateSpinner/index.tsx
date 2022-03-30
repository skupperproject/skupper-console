import React from 'react';

import { Title, EmptyState, EmptyStateIcon, Spinner } from '@patternfly/react-core';

const EmptyStateSpinner = function () {
  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        Loading
      </Title>
    </EmptyState>
  );
};

export default EmptyStateSpinner;
