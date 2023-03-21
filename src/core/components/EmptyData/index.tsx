import React, { FC } from 'react';

import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';

import { EmptyDataLabels } from './EmptyData.enum';

interface EmptyDataProps {
  message?: string;
  icon?: React.ComponentType;
}

const EmptyData: FC<EmptyDataProps> = function ({ message = EmptyDataLabels.Default, icon }) {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateBody>
          {icon && <EmptyStateIcon icon={icon} />}
          <Title headingLevel="h2" color="var(--pf-u-color-400)">
            {message}
          </Title>
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

export default EmptyData;
