import { Flex, Tooltip } from '@patternfly/react-core';
import { TableText } from '@patternfly/react-table';

import EarthIcon from '@assets/earth.svg';
import { timeAgo } from '@core/utils/timeAgo';

import { EndTimeProps } from './EndTime';

const EndTimeCell = function <T>({ value }: EndTimeProps<T>) {
  if (!value) {
    return null;
  }

  return (
    <Tooltip content={timeAgo(value as number)}>
      <TableText wrapModifier="truncate">
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <img src={EarthIcon} alt="Timestamp icon" width={14} className="pf-v5-u-mr-sm" />
          {timeAgo(value as number)}
        </Flex>
      </TableText>
    </Tooltip>
  );
};

export default EndTimeCell;
