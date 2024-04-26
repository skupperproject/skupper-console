import { ComponentType } from 'react';

export interface CalendarProps {
  date: Date;
  onChangeDate: (date: Date) => void;
  startDate?: Date;
}

export interface DateTimePickerProps {
  defaultDate?: string;
  defaultTime?: string;
  isDisabled?: boolean;
  startDate?: Date;
  onSelect?: Function;
  testid?: string;
  isTimePickerOpen?: boolean;
  CalendarComponent?: ComponentType<CalendarProps>;
}

export interface SelectTimeIntervalProps {
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
  duration?: number;
  isDateTimeRangeFilterOpen?: boolean;
}
