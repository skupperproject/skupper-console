import { ComponentType, FC } from 'react';

import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';

export enum SkEmptyDataLabels {
  Default = 'no data found'
}

interface SkEmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
  dataTestid?: string;
}

const SKEmptyData: FC<SkEmptyDataProps> = function ({
  message = SkEmptyDataLabels.Default,
  description,
  icon,
  ...props
}) {
  return (
    <Bullseye data-testid={props.dataTestid}>
      <EmptyState headingLevel="h2" titleText={message} variant={EmptyStateVariant.sm} isFullHeight icon={icon}>
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default SKEmptyData;
