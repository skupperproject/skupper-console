import { ReactNode } from 'react';

import { Icon, Content, Tooltip } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import { EMPTY_VALUE_SYMBOL } from '../../../config/app';
import { formatLocalizedDateTime } from '../../utils/formatLocalizedDateTime';

interface EndTimeCellProps<T> {
  data: T;
  value: ReactNode;
}

const SkEndTimeCell = function <T>({ value }: EndTimeCellProps<T>) {
  if (!value || !Number(value)) {
    return EMPTY_VALUE_SYMBOL;
  }

  return (
    <Tooltip content={formatLocalizedDateTime(value as number)}>
      <Content>
        <Icon size="md" isInline>
          <GlobeAmericasIcon />
        </Icon>{' '}
        {formatLocalizedDateTime(value as number)}
      </Content>
    </Tooltip>
  );
};

export default SkEndTimeCell;
