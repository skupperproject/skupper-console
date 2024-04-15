import { FC } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, fireEvent } from '@testing-library/react';

import DateTimePicker, { Calendar } from '../components/DateTimePicker';
import { CalendarProps } from '../Metrics.interfaces';

const CalendarComponentMock: FC<CalendarProps> = function ({ onChangeDate }) {
  return (
    <Button
      data-testid="date-time-picker-calendar-panel"
      onClick={() => {
        onChangeDate(new Date());
      }}
    >
      Calendar Text
    </Button>
  );
};

describe('Calendar component', () => {
  const onChangeDateMock = jest.fn();

  it('should render the Calendar component with date', () => {
    const { getByTestId, getAllByText } = render(<Calendar date={new Date()} onChangeDate={onChangeDateMock} />);

    expect(getByTestId('calendar')).toBeInTheDocument();
    expect(getAllByText('1')[0]).toBeInTheDocument();

    fireEvent.click(getAllByText('1')[0]);
    expect(onChangeDateMock).toHaveBeenCalledTimes(1);
  });
});

describe('DateTimePicker component', () => {
  const onSelectMock = jest.fn();

  it('should render with the provided initial date', () => {
    render(<DateTimePicker startDate={new Date('2022-08-11')} />);
    const dateTimePickerInput = screen.getByTestId('date-time-picker-calendar-button');
    expect(dateTimePickerInput).toBeInTheDocument();
  });

  it('should disable the calendar button when the isDisabled prop is true', () => {
    render(<DateTimePicker isDisabled={true} startDate={new Date('2022-08-11')} />);

    const dateTimePickerInput = screen.getByTestId('date-time-picker-calendar-button');
    expect(dateTimePickerInput).toBeDisabled();
  });

  it('should open the calendar panel when the calendar button is clicked', () => {
    const { getByTestId } = render(
      <DateTimePicker
        startDate={new Date('2022-08-11')}
        onSelect={onSelectMock}
        CalendarComponent={CalendarComponentMock}
      />
    );

    fireEvent.click(getByTestId('date-time-picker-calendar-button'));

    const calendarBox = getByTestId('date-time-picker-calendar-panel');
    expect(calendarBox).toBeInTheDocument();

    fireEvent.click(calendarBox);

    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('should open the time dropdown and allow selecting a time', () => {
    const { getByTestId, getByText } = render(<DateTimePicker onSelect={onSelectMock} />);

    fireEvent.click(getByTestId('date-time-picker-calendar-dropdown-button'));

    const timeItem = getByText('1:00');
    expect(timeItem).toBeInTheDocument(); // Time dropdown should be open

    fireEvent.click(timeItem);

    expect(onSelectMock).toHaveBeenCalledWith({ seconds: expect.any(Number) });
  });

  it('should toggle the calendar panel on clicking the calendar button', () => {
    render(<DateTimePicker CalendarComponent={CalendarComponentMock} />);

    const calendarButton = screen.getByTestId('date-time-picker-calendar-button');
    fireEvent.click(calendarButton);

    const calendarBox = screen.getByTestId('date-time-picker-calendar-panel');
    expect(calendarBox).toBeInTheDocument();

    fireEvent.click(calendarButton);
    expect(calendarBox).not.toBeInTheDocument();
  });
});
