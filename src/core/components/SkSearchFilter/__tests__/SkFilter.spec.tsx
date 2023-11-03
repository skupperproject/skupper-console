import { render, fireEvent } from '@testing-library/react';

import SkSearchFilter from '..';

describe('SkSearchFilter', () => {
  const onSearchMock = jest.fn();
  const selectOptions = [
    { id: 'option1', name: 'Option 1' },
    { id: 'option2', name: 'Option 2' }
  ];

  it('should handle input change', () => {
    const { getByPlaceholderText } = render(<SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />);

    const searchInput = getByPlaceholderText('Search by option 1') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(searchInput.value).toBe('test');
  });

  it('should delete filter when input value is empty', () => {
    const { getByPlaceholderText } = render(<SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />);
    const searchInput = getByPlaceholderText('Search by option 1') as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: null } });
    expect(searchInput.value).toBe('');
  });

  it('should clear input on clear button click', () => {
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
