import { render, fireEvent } from '@testing-library/react';

import SkSearchFilter from '..';

describe('SkSearchFilter', () => {
  it('should handle input change', () => {
    const onSearchMock = jest.fn();
    const selectOptions = [
      { id: 'option1', name: 'Option 1' },
      { id: 'option2', name: 'Option 2' }
    ];

    const { getByPlaceholderText } = render(<SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />);

    const searchInput = getByPlaceholderText('Search by option 1') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(searchInput.value).toBe('test');
  });

  it('should clear input on clear button click', () => {
    const onSearchMock = jest.fn();
    const selectOptions = [
      { id: 'option1', name: 'Option 1' },
      { id: 'option2', name: 'Option 2' }
    ];

    const { getByPlaceholderText, getByText } = render(
      <SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />
    );

    const searchInput = getByPlaceholderText('Search by option 1') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = getByText('Clear all filters');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });
});
