import { ReactNode } from 'react';

import { Icon, Content, Tooltip } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { EMPTY_VALUE_SYMBOL } from '../../../config/app';
import { timeAgo } from '../../utils/timeAgo';

interface EndTimeProps<T> {
  data: T;
  value: ReactNode;
}

const SkEndTimeCell = function <T>({ value }: EndTimeProps<T>) {
  if (!value || !Number(value)) {
    return EMPTY_VALUE_SYMBOL;
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
