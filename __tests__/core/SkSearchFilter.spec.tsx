import { render } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import SkSearchFilter from '../../src/core/components/SkTable/SkSearchFilter';
import { testIds } from '../../src/core/components/SkTable/SkSearchFilter/SkSearchFilter.testIds';

describe('SkSearchFilter', () => {
  const onSearchMock = jest.fn();
  const selectOptions = [
    { id: 'option1', name: 'Option 1' },
    { id: 'option2', name: 'Option 2' }
  ];

  it('should handle input change', async () => {
    const { getByTestId } = render(<SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />);

    const searchInput = getByTestId(testIds.searchBox).querySelector('input') as HTMLInputElement;

    await eventUser.type(searchInput, 'test');
    expect(searchInput?.value).toBe('test');

    expect(getByTestId(testIds.groupFilterLabels)).toBeInTheDocument();
    expect(getByTestId(testIds.groupFilterLabelsBtn)).toBeInTheDocument();
  });

  it('should clear the input search text by hand', async () => {
    const { getByTestId } = render(
      <SkSearchFilter text="test" onSearch={onSearchMock} selectOptions={selectOptions} />
    );

    const searchInput = getByTestId(testIds.searchBox).querySelector('input') as HTMLInputElement;

    await eventUser.clear(searchInput);
    expect(searchInput.value).toBe('');
  });

  it('should clear the input search text by clicking on the search box reset button', async () => {
    const { getByTestId } = render(
      <SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} text="test" />
    );

    const searchBox = getByTestId(testIds.searchBox) as HTMLInputElement;

    await eventUser.click(searchBox.querySelector('button') as HTMLButtonElement);
    expect(searchBox.querySelector('input')?.value).toBe('');
  });

  it('should clear input by clicking on the clear all filters button', async () => {
    const { getByTestId, queryByTestId } = render(
      <SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />
    );
    const searchInput = getByTestId(testIds.searchBox).querySelector('input') as HTMLInputElement;

    await eventUser.type(searchInput, 'test');

    expect(getByTestId(testIds.groupFilterLabels)).toBeInTheDocument();

    const clearButton = getByTestId(testIds.groupFilterLabelsBtn);
    expect(clearButton).toBeInTheDocument();

    await eventUser.click(clearButton);
    expect(queryByTestId(testIds.groupFilterLabels)).not.toBeInTheDocument();
  });

  it('should change the filter type selection', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />
    );
    let selectedFilterBtn = getByText(selectOptions[0].name);

    await eventUser.click(selectedFilterBtn);
    expect(getByTestId(testIds.selectFilterType)).toBeInTheDocument();

    selectedFilterBtn = getByText(selectOptions[1].name);

    await eventUser.click(selectedFilterBtn);
    expect(getByPlaceholderText(`Search by ${selectOptions[1].name.toLowerCase()}`)).toBeInTheDocument();
  });

  it('should change the filter type selection', async () => {
    const { getByTestId, getByRole } = render(<SkSearchFilter onSearch={onSearchMock} selectOptions={selectOptions} />);
    const searchInput = getByTestId(testIds.searchBox).querySelector('input') as HTMLInputElement;

    await eventUser.type(searchInput, 'test');

    const filterLabelBtn = getByRole('group').querySelector('button') as HTMLButtonElement;

    await eventUser.click(filterLabelBtn);
    expect(filterLabelBtn).not.toBeInTheDocument();
  });
});
