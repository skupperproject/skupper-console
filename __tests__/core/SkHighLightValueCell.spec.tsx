import React from 'react';

import { render } from '@testing-library/react';

import { VarColors } from '../../src/config/colors';
import SkHighlightValueCell from '../../src/core/components/SkHighlightValueCell';

describe('SkHighlightValueCell', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render without highlighting when value is not updated', () => {
    const data = { id: 1, name: 'Test' };
    const value = 42;
    const format = jest.fn((val) => val);

    const useRefSpy = jest.spyOn(React, 'useRef');
    useRefSpy.mockReturnValue({ current: value });

    const { getByText, queryByTestId } = render(<SkHighlightValueCell data={data} value={value} format={format} />);

    expect(getByText('42')).toBeInTheDocument();
    expect(format).toHaveBeenCalledWith(value);
    expect(queryByTestId('highlighted-value')).not.toBeInTheDocument();
  });

  it('should render with highlighting when value is updated', () => {
    const data = { id: 1, name: 'Test' };
    const value = 42;
    const newValue = 50;
    const format = jest.fn((val) => val);

    const useRefSpy = jest.spyOn(React, 'useRef');
    useRefSpy.mockReturnValue({ current: value });

    const { getByText, getByTestId } = render(<SkHighlightValueCell data={data} value={newValue} format={format} />);

    expect(getByText('50')).toBeInTheDocument();
    expect(format).toHaveBeenCalledWith(newValue);
    expect(getByTestId('highlighted-value')).toBeInTheDocument();
    expect(getByTestId('highlighted-value')).toHaveStyle(`color: ${VarColors.Green500}; font-weight: 900;`);
  });
});
