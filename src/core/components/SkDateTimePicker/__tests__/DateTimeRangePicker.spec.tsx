import { render, fireEvent, screen } from '@testing-library/react';

import { timeIntervalMap } from '@config/prometheus';

import { DateTimeRangeFilterContent } from '../DateTimeRangeFilter';
import { SkDateTimePickerLabels } from '../SkDateTimeRangeFilter.enum';

describe('DateTimeRangeFilter component', () => {
  const onSelectTimeIntervalMock = jest.fn();
  const onChangeLabelMock = jest.fn();
  const onShowTimeIntervalMock = jest.fn();

  it('should render the component with default labels', () => {
    render(
      <DateTimeRangeFilterContent
        startTimeLimit={1695433450000000}
        startSelected={1699236000}
        endSelected={1699237800}
        showTimeInterval={onShowTimeIntervalMock}
        onSelectTimeInterval={onSelectTimeIntervalMock}
        onChangeLabel={onChangeLabelMock}
      />
    );

    expect(screen.getByText(SkDateTimePickerLabels.CalendarTitlePicker)).toBeInTheDocument();
    expect(screen.getByText(SkDateTimePickerLabels.StarDatePicker)).toBeInTheDocument();
    expect(screen.getByText(SkDateTimePickerLabels.EndDatePicker)).toBeInTheDocument();
    expect(screen.getByText(SkDateTimePickerLabels.CalendarPickerButton)).toBeInTheDocument();
  });

  it('should select a time interval from the dropdown and call the callback function', () => {
    render(
      <DateTimeRangeFilterContent
        startTimeLimit={1695433450000000}
        startSelected={1699236000}
        endSelected={1699237800}
        showTimeInterval={onShowTimeIntervalMock}
        onSelectTimeInterval={onSelectTimeIntervalMock}
        onChangeLabel={onChangeLabelMock}
      />
    );
    const dropdownButton = screen.getByText(SkDateTimePickerLabels.CalendarTitlePicker);
    fireEvent.click(dropdownButton);

    const timeIntervalOption = screen.getByText(timeIntervalMap.fiveMinutes.label);
    fireEvent.click(timeIntervalOption);

    expect(onSelectTimeIntervalMock).toHaveBeenCalledWith({
      start: undefined,
      end: undefined,
      duration: 300
    });
  });
});
