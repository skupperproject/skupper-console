import { render, screen } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import { defaultTimeInterval, timeIntervalMap } from '@config/prometheus';

import SkTimeRangeFilter from '../index';
import { TimeRangeFilterProps } from '../SkTimeRange.interfaces';

const defaultProps: TimeRangeFilterProps = {
  duration: defaultTimeInterval.seconds,
  onSelectTimeInterval: jest.fn()
};

describe('SkTimeRangeFilter', () => {
  it('should toggle isOpen state on button click', async () => {
    const mockHandleToggle = jest.fn();
    render(<SkTimeRangeFilter {...defaultProps} onSelectTimeInterval={mockHandleToggle} />);

    await eventUser.click(screen.getByTestId('sk-time-range-filter-type'));
    await eventUser.click(screen.getByText(timeIntervalMap.fiveMinutes.label));

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });
});
