import { FC, useState } from 'react';

import { OutlinedClockIcon } from '@patternfly/react-icons';

import { defaultTimeInterval, timeIntervalMap } from '@config/prometheus';

import SkSelect from '../SkSelect';

interface TimeRangeFilterProps {
  duration?: number;
  onSelectTimeInterval: ({
    start,
    end,
    duration
  }: {
    start: number | undefined;
    end: number | undefined;
    duration: number | undefined;
  }) => void;
}

const SkTimeRangeFilter: FC<TimeRangeFilterProps> = function ({ duration, onSelectTimeInterval }) {
  const [startLabel, setStartLabel] = useState<number>(duration || defaultTimeInterval.seconds);

  const handleSelectFromTimeInterval = (seconds: string) => {
    setStartLabel(Number(seconds));

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start: undefined, end: undefined, duration: Number(seconds) });
    }
  };

  return (
    <SkSelect
      selected={startLabel.toString()}
      items={Object.values(timeIntervalMap).map(({ label, seconds }) => ({ id: seconds.toString(), label }))}
      icon={<OutlinedClockIcon />}
      formatToggle={() => findDurationLabel(duration)}
      onSelect={handleSelectFromTimeInterval}
    />
  );
};

export default SkTimeRangeFilter;
function findDurationLabel(duration?: number) {
  return (
    Object.values(timeIntervalMap).find(({ seconds }) => seconds === duration)?.label || timeIntervalMap.oneMinute.label
  );
}
