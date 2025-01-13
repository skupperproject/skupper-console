import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import SkDurationCell from '../src/core/components/SKDurationCell';
import { formatLatency } from '../src/core/utils/formatLatency';

vi.mock('../src/core/utils/formatLatency', () => ({
  formatLatency: vi.fn()
}));

describe('SkDurationCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the formatted duration when value is provided', () => {
    const value = 123456; // microseconds
    const formattedLatency = '123 ms';

    (formatLatency as Mock).mockReturnValue(formattedLatency);

    render(<SkDurationCell value={value} data={{}} />);

    expect(formatLatency).toHaveBeenCalledWith(value);
    expect(screen.getByText(formattedLatency)).toBeInTheDocument();
  });

  it('renders null when value is falsy', () => {
    const { container } = render(<SkDurationCell value={null} data={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
