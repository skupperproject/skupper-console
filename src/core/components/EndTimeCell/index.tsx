import { Tooltip, Truncate } from '@patternfly/react-core';

import EarthIcon from '@assets/earth.svg';
import { timeAgo } from '@core/utils/timeAgo';

import { EndTimeProps } from './EndTime';

const EndTimeCell = function <T>({ value }: EndTimeProps<T>) {
  if (!value) {
    return null;
  }

  typeof value;

  return (
    <Tooltip content={timeAgo(value as number)}>
      <div style={{ display: 'flex' }}>
        <img src={EarthIcon} alt="Timestamp icon" width={14} className="pf-v5-u-mr-sm" />
        <Truncate content={timeAgo(value as number)} position={'middle'} />
      </div>
    </Tooltip>
  );
};

export default EndTimeCell;
