import React, { FC, Fragment, useEffect, useState } from 'react';

import {
  CalendarMonth,
  InputGroup,
  InputGroupItem,
  TextInput,
  Button,
  Popover,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement
} from '@patternfly/react-core';
import { OutlinedCalendarAltIcon, OutlinedClockIcon } from '@patternfly/react-icons';
import { format } from 'date-fns';

import { formatDate, formatTime } from '../Metrics.constants';
import { DateTimePickerProps } from '../Metrics.interfaces';

const DateTimePicker: FC<DateTimePickerProps> = function ({
  defaultDate = formatDate,
  defaultTime = formatTime,
  isDisabled = false,
  startDate,
  onSelect
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [valueDate, setValueDate] = useState(defaultDate);
  const [valueTime, setValueTime] = useState(defaultTime);

  const disablePreEndDates = (date: Date) => date <= new Date();
  const disablePreStartDates = (date: Date) => (startDate ? date >= startDate : true);

  const handleToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    setIsTimeOpen(false);
  };

  const handleToggleTime = () => {
    setIsTimeOpen(!isTimeOpen);
    setIsCalendarOpen(false);
  };

  const handleSelectCalendar = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, newValueDate: Date) => {
    const date = format(newValueDate, formatDate);
    const time = valueTime === formatTime ? '1:00' : valueTime;
    setIsCalendarOpen(!isCalendarOpen);
    setValueDate(date);
    setValueTime(time);

    if (onSelect) {
      onSelect({
        seconds: new Date(Date.parse(`${date} ${time}`)).getTime() / 1000
      });
    }
  };

  const handleSelectTime = (ev: React.MouseEvent<Element, MouseEvent> | undefined) => {
    const date = valueDate === formatDate ? format(new Date(), formatDate) : valueDate;
    const time = ev?.currentTarget?.textContent as string;

    setIsTimeOpen(!isTimeOpen);
    setValueDate(date);
    setValueTime(time);

    if (onSelect) {
      onSelect({
        seconds: new Date(Date.parse(`${date} ${time}`)).getTime() / 1000
      });
    }
  };

  useEffect(() => {
    setValueDate(defaultDate);
    setValueTime(defaultTime);
  }, [defaultDate, defaultTime]);

  const Calendar = (
    <CalendarMonth
      data-testid="date-time-picker-calendar"
      date={new Date(valueDate)}
      onChange={handleSelectCalendar}
      validators={[disablePreEndDates, disablePreStartDates]}
    />
  );

  const TimeDropdown = (
    <Dropdown
      onSelect={handleSelectTime}
      isOpen={isTimeOpen}
      isScrollable
      onOpenChange={(isOpen: boolean) => setIsTimeOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={handleToggleTime}
          isExpanded={isTimeOpen}
          icon={<OutlinedClockIcon />}
          isDisabled={isDisabled}
        />
      )}
    >
      <DropdownList>
        {Array.from(new Array(24), (_, i) => i).map((time) => (
          <Fragment key={time}>
            <DropdownItem>{`${time + 1}:00`}</DropdownItem>
            <DropdownItem>{`${time + 1}:30`}</DropdownItem>
          </Fragment>
        ))}
      </DropdownList>
    </Dropdown>
  );

  const CalendarButton = (
    <Button
      data-testid="date-time-picker-calendar-button"
      variant="control"
      onClick={handleToggleCalendar}
      isDisabled={isDisabled}
    >
      <OutlinedCalendarAltIcon />
    </Button>
  );

  return (
    <Popover
      position="bottom"
      bodyContent={Calendar}
      showClose={false}
      isVisible={isCalendarOpen}
      hasNoPadding
      hasAutoWidth
    >
      <InputGroup>
        <InputGroupItem>
          <TextInput
            type="text"
            id={`${valueDate}  ${valueTime}`}
            value={`${valueDate}  ${valueTime}`}
            readOnlyVariant="default"
            isDisabled={isDisabled}
          />
        </InputGroupItem>
        <InputGroupItem>{CalendarButton}</InputGroupItem>
        <InputGroupItem>{TimeDropdown}</InputGroupItem>
      </InputGroup>
    </Popover>
  );
};

export default DateTimePicker;
