import React from 'react';

import { Tooltip } from '@patternfly/react-core';
import { TableText } from '@patternfly/react-table';

import { formatTimeInterval } from '@core/utils/formatTimeInterval';

import { DurationCellProps } from './DurationCell';

/**
 *  startTime and endTime are expected to be in microseconds
 */
const DurationCell = function <T>({ startTime, endTime = Date.now() * 1000 }: DurationCellProps<T>) {
  const duration = formatTimeInterval(endTime / 1000, startTime / 1000);

  return (
    <Tooltip content={duration}>
      <TableText wrapModifier="truncate">{duration}</TableText>
    </Tooltip>
  );
};

export default DurationCell;
