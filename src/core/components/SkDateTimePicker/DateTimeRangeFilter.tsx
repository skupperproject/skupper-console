import { FC, useCallback, useRef, useState } from 'react';

import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Menu,
  MenuContent,
  MenuItem,
  MenuToggle,
  Popover,
  Title
} from '@patternfly/react-core';
import { OutlinedClockIcon } from '@patternfly/react-icons';
import { format } from 'date-fns';

import { timeIntervalMap } from '@config/prometheus';

import { formatDate, formatTime } from './SkDateTimePicker.constants';
import { SelectTimeIntervalProps } from './SkDateTimePicker.interfaces';
import { SkDateTimePickerLabels } from './SkDateTimeRangeFilter.enum';

import SkDateTimePicker from '.';

interface DateTimeRangeFitlterContnt {
  startTimeLimit: number;
  onSelectTimeInterval: ({
    start,
    end,
    duration
  }: {
    start: number | undefined;
    end: number | undefined;
    duration: number | undefined;
  }) => void;
  defaultLabel?: string;
  startSelected?: number;
  endSelected?: number;
  showTimeInterval: (value: boolean) => void;
  onChangeLabel: (label: string | undefined, type: 'end' | 'start') => void;
}

export const DateTimeRangeFilterContent: FC<DateTimeRangeFitlterContnt> = function ({
  startTimeLimit,
  onSelectTimeInterval,
  startSelected,
  endSelected,
  onChangeLabel,
  showTimeInterval
}) {
  const [start, setStart] = useState<number | undefined>(startSelected);
  const [end, setEnd] = useState<number | undefined>(endSelected);

  const handleSetDateTimeStart = ({ seconds }: { label: string; seconds: number }) => {
    setStart(seconds);
    onChangeLabel(formatDateTime(seconds), 'start');

    if (end && seconds > end) {
      setEnd(seconds + 60 * 30);
      onChangeLabel(formatDateTime(seconds + 60 * 30), 'end');
    }
  };
  const handleSetDateTimeEnd = ({ seconds }: { label: string; seconds: number }) => {
    setEnd(seconds);
    onChangeLabel(formatDateTime(seconds), 'end');

    if (start && seconds < start) {
      setStart(seconds);
      onChangeLabel(formatDateTime(seconds), 'start');
    }
  };

  const handleSelectFromDateTimePicker = () => {
    showTimeInterval(false);

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start, end, duration: undefined });
    }
  };

  const handleSelectFromTimeInterval = (value: string) => {
    const { seconds, label } = timeIntervalMap[value as string];

    setStart(undefined);
    setEnd(undefined);
    onChangeLabel(label, 'start');
    onChangeLabel(undefined, 'end');
    showTimeInterval(false);

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start: undefined, end: undefined, duration: seconds });
    }
  };

  const startDate = new Date(startTimeLimit / 1000 - 60 * 60 * 24 * 1000);

  return (
    <Flex>
      <FlexItem>
        <DescriptionList>
          <DescriptionListTerm>
            <Title headingLevel="h4">{SkDateTimePickerLabels.CalendarTitlePicker}</Title>
          </DescriptionListTerm>
          <DescriptionListGroup>
            <DescriptionListTerm>{SkDateTimePickerLabels.StarDatePicker}</DescriptionListTerm>
            <DescriptionListDescription>
              <SkDateTimePicker
                onSelect={handleSetDateTimeStart}
                startDate={startDate}
                defaultDate={formatDateTime(start, formatDate)}
                defaultTime={formatDateTime(start, formatTime)}
                testid="date-time-picker-calendar-start"
              />
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{SkDateTimePickerLabels.EndDatePicker}</DescriptionListTerm>
            <DescriptionListDescription>
              <SkDateTimePicker
                onSelect={handleSetDateTimeEnd}
                isDisabled={!start}
                startDate={startDate}
                defaultDate={formatDateTime(end, formatDate)}
                defaultTime={formatDateTime(end, formatTime)}
                testid="date-time-picker-calendar-end"
              />
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListDescription>
              <Button
                data-testid="date-time-picker-calendar-button"
                variant="primary"
                onClick={() => handleSelectFromDateTimePicker()}
                isDisabled={!(start && end)}
              >
                {SkDateTimePickerLabels.CalendarPickerButton}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>

      <Divider
        orientation={{
          default: 'vertical'
        }}
      />

      <FlexItem>
        <Menu onSelect={(_, value) => handleSelectFromTimeInterval(value as string)} isPlain={true} isScrollable>
          <MenuContent>{getTimeIntervals(startTimeLimit)}</MenuContent>
        </Menu>
      </FlexItem>
    </Flex>
  );
};

const DateTimeRangeFilter: FC<SelectTimeIntervalProps> = function ({
  startTimeLimit,
  onSelectTimeInterval,
  startSelected,
  endSelected,
  duration,
  isDateTimeRangeFilterOpen = false
}) {
  const popoverRef = useRef<HTMLInputElement>(null);

  const [isTimeIntervalOpen, setIsTimeIntervalOpen] = useState(isDateTimeRangeFilterOpen);
  const [startLabel, setStartLabel] = useState<string | undefined>(
    startSelected ? formatDateTime(startSelected) : findDurationLabel(duration)
  );
  const [endLabel, setEndLabel] = useState<string | undefined>(formatDateTime(endSelected));

  const handleToggle = useCallback(() => {
    setIsTimeIntervalOpen(!isTimeIntervalOpen);
  }, [isTimeIntervalOpen]);

  const handleChangeLabel = useCallback((label: string | undefined, type: 'start' | 'end') => {
    type === 'start' ? setStartLabel(label) : setEndLabel(label);
  }, []);

  // The timeInterval dropdown doesn't has endLabel= undefined and show the text last min. last day ecc...
  const label = endLabel ? [startLabel, endLabel].join(' to ') : startLabel;

  return (
    <Popover
      position="left"
      bodyContent={
        <DateTimeRangeFilterContent
          startTimeLimit={startTimeLimit}
          startSelected={startSelected}
          endSelected={endSelected}
          onSelectTimeInterval={onSelectTimeInterval}
          onChangeLabel={handleChangeLabel}
          showTimeInterval={setIsTimeIntervalOpen}
        />
      }
      showClose={false}
      isVisible={isTimeIntervalOpen}
      hasAutoWidth
      triggerRef={popoverRef}
    >
      <MenuToggle ref={popoverRef} onClick={handleToggle} icon={<OutlinedClockIcon />}>
        {label}
      </MenuToggle>
    </Popover>
  );
};

export default DateTimeRangeFilter;

function formatDateTime(seconds?: number, stringFormat = `${formatDate}  ${formatTime}`) {
  if (!seconds) {
    return undefined;
  }

  return format(new Date(seconds * 1000), stringFormat);
}

function getTimeIntervals(startTime: number) {
  return Object.values(timeIntervalMap)
    .filter(({ seconds }) => new Date().getTime() - seconds * 1000 > startTime / 1000)
    .map(({ key, label }, index) => (
      <MenuItem key={index} itemId={key}>
        {label}
      </MenuItem>
    ));
}

function findDurationLabel(duration?: number) {
  return (
    Object.values(timeIntervalMap).find(({ seconds }) => seconds === duration)?.label || timeIntervalMap.oneMinute.label
  );
}
