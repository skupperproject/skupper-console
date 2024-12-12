import { render, screen } from '@testing-library/react';

import SkDurationCell from '../src/core/components/SKDurationCell';
import { formatLatency } from '../src/core/utils/formatLatency';

jest.mock('../src/core/utils/formatLatency', () => ({
  formatLatency: jest.fn()
}));

describe('SkDurationCell', () => {
  it('renders the formatted duration when value is provided', () => {
    const value = 123456; // microseconds
    const formattedLatency = '123 ms';

    (formatLatency as jest.Mock).mockReturnValue(formattedLatency);

    render(<SkDurationCell value={value} data={{}} />);

    expect(formatLatency).toHaveBeenCalledWith(value);
    expect(screen.getByText(formattedLatency)).toBeInTheDocument();
  });

  it('renders null when value is falsy', () => {
    const { container } = render(<SkDurationCell value={null} data={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
