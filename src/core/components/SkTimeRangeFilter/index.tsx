import { FC, Ref, useCallback, useMemo, useState } from 'react';

import { MenuToggle, MenuToggleElement, Select, SelectList, SelectOption } from '@patternfly/react-core';
import { OutlinedClockIcon } from '@patternfly/react-icons';

import { defaultTimeInterval, timeIntervalMap } from '@config/prometheus';

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
  const [isOpen, setIsOpen] = useState(false);

  const [startLabel, setStartLabel] = useState<number>(duration || defaultTimeInterval.seconds);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelectFromTimeInterval = (seconds: number) => {
    setStartLabel(seconds);
    setIsOpen(false);

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start: undefined, end: undefined, duration: seconds });
    }
  };

  const timeInterval = useMemo(
    () => (
      <>
        {Object.values(timeIntervalMap).map(({ label, seconds }) => (
          <SelectOption key={seconds} value={seconds} isSelected={false}>
            {label}
          </SelectOption>
        ))}
      </>
    ),
    []
  );

  return (
    <Select
      role="menu"
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={handleToggle} isExpanded={isOpen} data-testid="sk-time-range-filter-type">
          <OutlinedClockIcon /> {findDurationLabel(startLabel)}
        </MenuToggle>
      )}
      onSelect={(_, value) => handleSelectFromTimeInterval(value as number)}
      selected={startLabel}
      isOpen={isOpen}
      onOpenChange={() => isOpen && setIsOpen(false)}
    >
      <SelectList>{timeInterval}</SelectList>
    </Select>
  );
};

export default SkTimeRangeFilter;
function findDurationLabel(duration?: number) {
  return (
    Object.values(timeIntervalMap).find(({ seconds }) => seconds === duration)?.label || timeIntervalMap.oneMinute.label
  );
}
