import { ComponentType, FC } from 'react';

import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';

import { Labels } from '../../../config/labels';

interface SkEmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
  dataTestid?: string;
}

const SKEmptyData: FC<SkEmptyDataProps> = function ({ message = Labels.NoDataFound, description, icon, ...props }) {
  return (
    <Bullseye data-testid={props.dataTestid}>
      <EmptyState headingLevel="h2" titleText={message} variant={EmptyStateVariant.sm} isFullHeight icon={icon}>
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default SKEmptyData;
