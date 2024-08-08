import { ComponentType, FC } from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant
} from '@patternfly/react-core';

export enum SkEmptyDataLabels {
  Default = 'no data found'
}

interface SkEmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
}

const SKEmptyData: FC<SkEmptyDataProps> = function ({ message = SkEmptyDataLabels.Default, description, icon }) {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.sm} isFullHeight>
        <EmptyStateHeader titleText={message} headingLevel="h2" icon={icon && <EmptyStateIcon icon={icon} />} />
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default SKEmptyData;
