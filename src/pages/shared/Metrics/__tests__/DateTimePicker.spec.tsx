import { render, screen, fireEvent } from '@testing-library/react';

import DateTimePicker from '../components/DateTimePicker';

describe('DateTimePicker', () => {
  it('should render with default values', () => {
    render(<DateTimePicker startDate={new Date('2022-08-11')} />);
    const dateTimePickerInput = screen.getByTestId('date-time-picker-calendar-button');
    expect(dateTimePickerInput).toBeInTheDocument();
  });

  it('should open the calendar when clicking the calendar button', () => {
    render(<DateTimePicker startDate={new Date('2022-08-11')} />);

    const calendarButton = screen.getByTestId('date-time-picker-calendar-button');
    fireEvent.click(calendarButton);

    const calendar = screen.getByTestId('date-time-picker-calendar');
    expect(calendar).toBeInTheDocument();
  });

  it('should select a date and time from the calendar and time dropdown', () => {
    const onSelectMock = jest.fn();
    render(<DateTimePicker onSelect={onSelectMock} startDate={new Date('2022-08-11')} />);
    const calendarButton = screen.getByTestId('date-time-picker-calendar-button');
    fireEvent.click(calendarButton);

    const calendar = screen.getByTestId('date-time-picker-calendar');
    fireEvent.change(calendar);

    const timeDropdownToggle = screen.getByTestId('date-time-picker-calendar-dropdown-button');
    fireEvent.click(timeDropdownToggle);

    const timeDropdownItem = screen.getByText('12:00');
    fireEvent.click(timeDropdownItem);

    // Make sure onSelect is called with the expected date and time
    expect(onSelectMock).toHaveBeenCalledWith({ seconds: expect.any(Number) });
  });

  it('should disable the component when isDisabled is true', () => {
    render(<DateTimePicker isDisabled={true} startDate={new Date('2022-08-11')} />);
    const dateTimePickerInput = screen.getByTestId('date-time-picker-calendar-button');
    expect(dateTimePickerInput).toBeDisabled();
  });

  it('should toggle the calendar when clicking the calendar button', () => {
    const onSelectMock = jest.fn();
    render(<DateTimePicker onSelect={onSelectMock} startDate={new Date('2022-08-11')} />);

    const calendarButton = screen.getByTestId('date-time-picker-calendar-button');
    fireEvent.click(calendarButton);

    const calendar = screen.queryByTestId('date-time-picker-calendar');
    expect(calendar).toBeInTheDocument(); // Calendar should be open

    const cell = calendar?.querySelector('td button') as HTMLTableCellElement;
    fireEvent.click(cell);

    expect(onSelectMock).toHaveBeenCalledWith({ seconds: expect.any(Number) });
    expect(calendar).not.toBeInTheDocument(); // Calendar should be closed
  });

  it('should toggle the time dropdown when clicking the time dropdown button', () => {
    render(<DateTimePicker startDate={new Date('2022-08-11')} />);
    const timeDropdownToggle = screen.getByTestId('date-time-picker-calendar-dropdown-button');
    fireEvent.click(timeDropdownToggle);

    const timeDropdown = screen.queryByRole('menu');
    expect(timeDropdown).toBeInTheDocument(); // Time dropdown should be open

    fireEvent.click(timeDropdownToggle);
    expect(timeDropdown).not.toBeInTheDocument(); // Time dropdown should be closed
  });
});
