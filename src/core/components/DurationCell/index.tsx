import { Tooltip } from '@patternfly/react-core';
import { TableText } from '@patternfly/react-table';

import { formatLatency } from '@core/utils/formatLatency';

import { DurationCellProps } from './DurationCell';

/**
 *  value is expected to be in microseconds
 */
const DurationCell = function <T>({ value }: DurationCellProps<T>) {
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

export default DurationCell;
