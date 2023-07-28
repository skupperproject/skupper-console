import { ComponentType, FC } from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant
} from '@patternfly/react-core';

import { EmptyDataLabels } from './EmptyData.enum';

interface EmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
}

const EmptyData: FC<EmptyDataProps> = function ({ message = EmptyDataLabels.Default, description, icon }) {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.sm} isFullHeight>
        <EmptyStateHeader titleText={message} headingLevel="h2" icon={icon && <EmptyStateIcon icon={icon} />} />
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default EmptyData;
