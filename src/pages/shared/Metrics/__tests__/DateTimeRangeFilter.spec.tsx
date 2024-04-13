import { render, fireEvent, screen } from '@testing-library/react';

import { timeIntervalMap } from '@config/prometheus';

import { DateTimeRangeFilterContent } from '../components/DateTimeRangeFilter';
import { MetricsLabels } from '../Metrics.enum';

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

    expect(screen.getByText(MetricsLabels.CalendarTitlePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.StarDatePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.EndDatePicker)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.CalendarPickerButton)).toBeInTheDocument();
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
