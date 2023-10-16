import { FC, useRef, useState } from 'react';

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

import DateTimePicker from './DateTimePicker';
import { formatDate, formatTime } from '../Metrics.constants';
import { SelectTimeIntervalProps } from '../Metrics.interfaces';

const DateTimeRangeFilter: FC<SelectTimeIntervalProps> = function ({
  startTimeLimit,
  onSelectTimeInterval,
  startSelected,
  endSelected,
  duration
}) {
  const popoverRef = useRef<HTMLInputElement>(null);

  const [isTimeIntervalOpen, setIsTimeIntervalOpen] = useState(false);
  const [startLabel, setStartLabel] = useState<string | undefined>(
    startSelected ? formatDateTime(startSelected) : findDurationLabel(duration)
  );
  const [endLabel, setEndLabel] = useState<string | undefined>(formatDateTime(endSelected));
  const [start, setStart] = useState<number | undefined>(startSelected);
  const [end, setEnd] = useState<number | undefined>(endSelected);

  const handleToggle = () => {
    setIsTimeIntervalOpen(!isTimeIntervalOpen);
  };

  const handleSetDateTimeStart = ({ seconds }: { label: string; seconds: number }) => {
    setStart(seconds);
    setStartLabel(formatDateTime(seconds));

    if (end && seconds > end) {
      setEnd(seconds + 60 * 30);
      setEndLabel(formatDateTime(seconds + 60 * 30));
    }
  };
  const handleSetDateTimeEnd = ({ seconds }: { label: string; seconds: number }) => {
    setEnd(seconds);
    setEndLabel(formatDateTime(seconds));

    if (start && seconds < start) {
      setStart(seconds);
      setStartLabel(formatDateTime(seconds));
    }
  };

  const handleSelectFromDateTimePicker = () => {
    setIsTimeIntervalOpen(false);

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start, end, duration: undefined });
    }
  };

  const handleSelectFromTimeInterval = (value: string) => {
    const { seconds, label } = timeIntervalMap[value as string];

    setStart(undefined);
    setEnd(undefined);
    setStartLabel(label);
    setEndLabel(undefined);
    setIsTimeIntervalOpen(false);

    if (onSelectTimeInterval) {
      onSelectTimeInterval({ start: undefined, end: undefined, duration: seconds });
    }
  };

  // The timeInterval dropdown doesn't has endLabel= undefined and show the text last min. last day ecc...
  const label = endLabel ? [startLabel, endLabel].join(' to ') : startLabel;
  const startDate = new Date(startTimeLimit / 1000 - 60 * 60 * 24 * 1000);

  return (
    <Popover
      position="left"
      bodyContent={
        <Flex>
          <FlexItem>
            <DescriptionList>
              <DescriptionListTerm>
                <Title headingLevel="h4">Absolute time range</Title>
              </DescriptionListTerm>
              <DescriptionListGroup>
                <DescriptionListTerm>From</DescriptionListTerm>
                <DescriptionListDescription>
                  <DateTimePicker
                    onSelect={handleSetDateTimeStart}
                    startDate={startDate}
                    defaultDate={formatDateTime(start, formatDate)}
                    defaultTime={formatDateTime(start, formatTime)}
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>To</DescriptionListTerm>
                <DescriptionListDescription>
                  <DateTimePicker
                    onSelect={handleSetDateTimeEnd}
                    isDisabled={!start}
                    startDate={startDate}
                    defaultDate={formatDateTime(end, formatDate)}
                    defaultTime={formatDateTime(end, formatTime)}
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListDescription>
                  <Button
                    variant="primary"
                    onClick={() => handleSelectFromDateTimePicker()}
                    isDisabled={!(start && end)}
                  >
                    Apply time range
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
