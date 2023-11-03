import { render, fireEvent, screen } from '@testing-library/react';

import { timeIntervalMap } from '@config/prometheus';

import DateTimeRangeFilter from '../components/DateTimeRangeFilter';
import { MetricsLabels } from '../Metrics.enum';

describe('DateTimeRangeFilter Component', () => {
  const onSelectTimeIntervalMock = jest.fn();
  it('renders the component with default values', () => {
    render(
      <DateTimeRangeFilter
        startTimeLimit={1695433450000000}
        startSelected={1699236000}
        endSelected={1699237800}
        onSelectTimeInterval={onSelectTimeIntervalMock}
        isDateTimeRangeFilterOpen={true}
      />
    );

    expect(screen.getByText(MetricsLabels.CalendarTitlePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.StarDatePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.EndDatePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.CalendarPickerButton)).toBeInTheDocument();
  });

  it('selects a time interval from the dropdown', () => {
    render(
      <DateTimeRangeFilter
        startTimeLimit={1695433450000000}
        startSelected={1699236000}
        endSelected={1699237800}
        onSelectTimeInterval={onSelectTimeIntervalMock}
        isDateTimeRangeFilterOpen={true}
      />
    );
    const dropdownButton = screen.getByText(MetricsLabels.CalendarTitlePicker);
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
