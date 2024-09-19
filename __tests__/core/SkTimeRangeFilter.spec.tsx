import { render, screen } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import { defaultTimeInterval, timeIntervalMap } from '../../src/config/prometheus';
import SkTimeRangeFilter from '../../src/core/components/SkTimeRangeFilter/index';

describe('SkTimeRangeFilter', () => {
  it('should toggle isOpen state on button click', async () => {
    const mockHandleToggle = jest.fn();
    render(<SkTimeRangeFilter duration={defaultTimeInterval.seconds} onSelectTimeInterval={mockHandleToggle} />);

    await eventUser.click(screen.getByText(timeIntervalMap.oneMinute.label));
    await eventUser.click(screen.getByText(timeIntervalMap.fiveMinutes.label));

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });
});
