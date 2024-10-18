import { ReactNode } from 'react';

import { Tooltip } from '@patternfly/react-core';
import { TableText } from '@patternfly/react-table';

import { formatLatency } from '../../utils/formatLatency';

interface SKDurationCellProps<T> {
  data: T;
  value: ReactNode;
}

/**
 *  value is expected to be in microseconds
 */
const SkDurationCell = function <T>({ value }: SKDurationCellProps<T>) {
  if (!value) {
    return null;
  }

  const duration = formatLatency(value as number);

  return (
    <Tooltip content={duration}>
      <TableText wrapModifier="truncate">{duration}</TableText>
    </Tooltip>
  );
};

export default SkDurationCell;
