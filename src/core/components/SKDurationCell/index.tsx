import { ReactNode } from 'react';

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

  return formatLatency(value as number);
};

export default SkDurationCell;
