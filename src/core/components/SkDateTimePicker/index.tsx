import React, { FC, Fragment, useCallback, useEffect, useState } from 'react';

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

import { formatDate, formatTime } from './SkDateTimePicker.constants';
import { CalendarProps, DateTimePickerProps } from './SkDateTimePicker.interfaces';

export const Calendar: FC<CalendarProps> = function ({ date, onChangeDate, startDate }) {
  const disablePreEndDates = (currentDate: Date) => currentDate <= new Date();
  const disablePreStartDates = (currentDate: Date) => (startDate ? currentDate >= startDate : true);

  const handleChangeDate = useCallback(
    (_: React.MouseEvent<HTMLButtonElement, MouseEvent>, newDate: Date) => {
      onChangeDate(newDate);
    },
    [onChangeDate]
  );

  return (
    <CalendarMonth
      data-testid="calendar"
      date={new Date(date)}
      onChange={handleChangeDate}
      validators={[disablePreEndDates, disablePreStartDates]}
    />
  );
};

const SkDateTimePicker: FC<DateTimePickerProps> = function ({
  defaultDate = formatDate,
  defaultTime = formatTime,
  isDisabled = false,
  startDate,
  onSelect,
  testid = 'date-time-picker-calendar',
  CalendarComponent = Calendar,
  isTimePickerOpen = false
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(isTimePickerOpen);
  const [valueDate, setValueDate] = useState(defaultDate);
  const [valueTime, setValueTime] = useState(defaultTime);

  const handleToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    setIsTimeOpen(false);
  };

  const handleToggleTime = () => {
    setIsTimeOpen(!isTimeOpen);
    setIsCalendarOpen(false);
  };

  const handleSelectCalendar = useCallback(
    (date: Date) => {
      const dateFormatted = format(date, formatDate);
      const timeFormatted = valueTime === formatTime ? '1:00' : valueTime;
      setIsCalendarOpen(false);
      setValueDate(dateFormatted);
      setValueTime(timeFormatted);

      if (onSelect) {
        onSelect({
          seconds: new Date(Date.parse(`${dateFormatted} ${timeFormatted}`)).getTime() / 1000
        });
      }
    },
    [onSelect, valueTime]
  );

  const handleSelectTime = (ev: React.MouseEvent<Element, MouseEvent> | undefined) => {
    const date = valueDate === formatDate ? format(new Date(), formatDate) : valueDate;
    const time = ev?.currentTarget?.textContent as string;

    if (onSelect) {
      onSelect({
        seconds: new Date(Date.parse(`${date} ${time}`)).getTime() / 1000
      });
    }

    setValueDate(date);
    setValueTime(time);
    setIsTimeOpen(false);
  };

  useEffect(() => {
    setValueDate(defaultDate);
    setValueTime(defaultTime);
  }, [defaultDate, defaultTime]);

  const CalendarButton = (
    <Button data-testid={`${testid}-button`} variant="control" onClick={handleToggleCalendar} isDisabled={isDisabled}>
      <OutlinedCalendarAltIcon />
    </Button>
  );

  const TimeDropdown = (
    <Dropdown
      onSelect={handleSelectTime}
      isOpen={isTimeOpen}
      isScrollable
      onOpenChange={setIsTimeOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid={`${testid}-dropdown-button`}
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

  return (
    <Popover
      position="bottom"
      bodyContent={
        <CalendarComponent onChangeDate={handleSelectCalendar} date={new Date(valueDate)} startDate={startDate} />
      }
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

export default SkDateTimePicker;
