import { fireEvent, render } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import SkSelectMultiTypeaheadCheckbox from '@core/SkMultiTypeheadWithCheckbox';

const initialIdsSelected: string[] = [];
const mockOnSelected = jest.fn();
const initOptions = [
  { key: '1', value: '1', label: 'Service 1' },
  { key: '2', value: '2', label: 'Service 2' },
  { key: '3', value: '3', label: 'Service 3' }
];

describe('SkSelectMultiTypeaheadCheckbox', () => {
  it('renders select component with correct props', () => {
    const { getByRole, getByPlaceholderText } = render(
      <SkSelectMultiTypeaheadCheckbox
        initIdsSelected={initialIdsSelected}
        initOptions={initOptions}
        onSelected={mockOnSelected}
      />
    );

    const selectElement = getByRole('button');
    expect(selectElement).toBeInTheDocument();

    const placeholderTextElement = getByPlaceholderText(`${initialIdsSelected.length} services selected`);
    expect(placeholderTextElement).toBeInTheDocument();
  });

  it('renders options correctly', async () => {
    const { getByRole, getByText } = render(
      <SkSelectMultiTypeaheadCheckbox
        initIdsSelected={initialIdsSelected}
        initOptions={initOptions}
        onSelected={mockOnSelected}
      />
    );

    const selectElement = getByRole('button');
    await eventUser.click(selectElement);

    initOptions.forEach((option) => {
      const optionElement = getByText(option.label);
      expect(optionElement).toBeInTheDocument();
    });
  });

  it('calls selectService function on selecting an option', async () => {
    const { getByRole, getByText } = render(
      <SkSelectMultiTypeaheadCheckbox
        initIdsSelected={initialIdsSelected}
        initOptions={initOptions}
        onSelected={mockOnSelected}
      />
    );

    const selectElement = getByRole('button');
    await eventUser.click(selectElement);

    const optionToSelect = getByText('Service 1');
    await eventUser.click(optionToSelect);

    expect(mockOnSelected).toHaveBeenCalledWith(['1']);
  });

  it('filters options correctly based on search input', async () => {
    const { getByRole, getByPlaceholderText, queryByText } = render(
      <SkSelectMultiTypeaheadCheckbox
        initIdsSelected={initialIdsSelected}
        initOptions={initOptions}
        onSelected={mockOnSelected}
      />
    );

    const selectElement = getByRole('button');
    await eventUser.click(selectElement);

    const searchInput = getByPlaceholderText(`${initialIdsSelected.length} services selected`);
    fireEvent.change(searchInput, { target: { value: 'Service 1' } });

    expect(queryByText('Service 1')).toBeInTheDocument();
    expect(queryByText('Service 2')).not.toBeInTheDocument();
    expect(queryByText('Service 3')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Service' } });

    expect(queryByText('Service 1')).toBeInTheDocument();
    expect(queryByText('Service 2')).toBeInTheDocument();
    expect(queryByText('Service 3')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    expect(queryByText('Service 1')).not.toBeInTheDocument();
    expect(queryByText('Service 2')).not.toBeInTheDocument();
    expect(queryByText('Service 3')).not.toBeInTheDocument();
  });
});
