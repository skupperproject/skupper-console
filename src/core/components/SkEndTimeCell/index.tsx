import { ReactNode } from 'react';

import { Icon, Content, Tooltip } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { timeAgo } from '../../utils/timeAgo';

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
      <Content>
        <Icon size="md" isInline>
          <GlobeAmericasIcon />
        </Icon>{' '}
        {timeAgo(value as number)}
      </Content>
    </Tooltip>
  );
};

export default SkEndTimeCell;
