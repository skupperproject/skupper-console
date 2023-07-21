import { ComponentType, FC } from 'react';

import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';

import { EmptyDataLabels } from './EmptyData.enum';

interface EmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
}

const EmptyData: FC<EmptyDataProps> = function ({ message = EmptyDataLabels.Default, description, icon }) {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.small} isFullHeight>
        {icon && <EmptyStateIcon icon={icon} />}
        <Title headingLevel="h2" size="lg">
          {message}
        </Title>
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default EmptyData;
