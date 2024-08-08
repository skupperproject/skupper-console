import { ReactNode } from 'react';

import { Icon, Text, Tooltip, Truncate } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { timeAgo } from '@core/utils/timeAgo';

interface EndTimeProps<T> {
  data: T;
  value: ReactNode;
}

const SkEndTimeCell = function <T>({ value }: EndTimeProps<T>) {
  if (!value) {
    return null;
  }

  typeof value;

  return (
    <Tooltip content={timeAgo(value as number)}>
      <Text component="h4">
        <Icon size="md" isInline>
          <GlobeAmericasIcon />
        </Icon>{' '}
        <Truncate content={timeAgo(value as number)} position={'middle'} />
      </Text>
    </Tooltip>
  );
};

export default SkEndTimeCell;
