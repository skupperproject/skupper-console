import { renderHook, render, act } from '@testing-library/react';
import eventUser from '@testing-library/user-event';

import { Labels } from '../src/config/labels';
import DisplayOptions from '../src/pages/Topology/components/DisplayOptions';
import { useDisplayOptionsState } from '../src/pages/Topology/hooks/useDisplayOptionsState';
import { SHOW_DATA_LINKS, SHOW_ROUTER_LINKS } from '../src/pages/Topology/Topology.constants';

const mockOnSelected = jest.fn();
const defaultSelected: string[] = [];
const options = {
  title: 'test',
  items: [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
    { id: SHOW_DATA_LINKS, label: Labels.Pairs },
    { id: SHOW_ROUTER_LINKS, label: Labels.RouterLinks }
  ]
};

describe('useDisplayOptions', () => {
  it('initializes with defaultSelected values', () => {
    const { result } = renderHook(() =>
      useDisplayOptionsState({ defaultSelected: ['option1', 'option2'], onSelected: mockOnSelected })
    );
    expect(result.current.displayOptionsSelected).toEqual(['option1', 'option2']);
  });

  it('adds and removes options correctly', () => {
    const { result } = renderHook(() => useDisplayOptionsState({ defaultSelected: [], onSelected: mockOnSelected }));
    const { selectDisplayOptions } = result.current;

    // Add an option
    act(() => selectDisplayOptions('option1'));
    expect(result.current.displayOptionsSelected).toContain('option1');

    // Remove the option
    act(() => selectDisplayOptions('option1'));
    expect(result.current.displayOptionsSelected).not.toContain(['option1']);
  });

  it('toggles between SHOW_DATA_LINKS and SHOW_ROUTER_LINKS correctly', () => {
    const { result } = renderHook(() =>
      useDisplayOptionsState({ defaultSelected: [SHOW_DATA_LINKS], onSelected: mockOnSelected })
    );

    // Initially, SHOW_DATA_LINKS is selected
    expect(result.current.displayOptionsSelected).toContain(SHOW_DATA_LINKS);
    expect(result.current.displayOptionsSelected).not.toContain(SHOW_ROUTER_LINKS);

    // Select SHOW_ROUTER_LINKS, which should remove SHOW_DATA_LINKS
    act(() => result.current.selectDisplayOptions(SHOW_ROUTER_LINKS));
    expect(result.current.displayOptionsSelected).toContain(SHOW_ROUTER_LINKS);
    expect(result.current.displayOptionsSelected).not.toContain([SHOW_DATA_LINKS]);
  });

  it('clicks on SHOW_DATA_LINKS already checked and SHOW_ROUTER_LINKS correctly', () => {
    const { result } = renderHook(() =>
      useDisplayOptionsState({ defaultSelected: [SHOW_DATA_LINKS], onSelected: mockOnSelected })
    );

    // Initially, SHOW_DATA_LINKS is selected
    expect(result.current.displayOptionsSelected).toContain(SHOW_DATA_LINKS);
    expect(result.current.displayOptionsSelected).not.toContain(SHOW_ROUTER_LINKS);

    act(() => result.current.selectDisplayOptions(SHOW_DATA_LINKS));
    expect(result.current.displayOptionsSelected).toContain(SHOW_ROUTER_LINKS);
    expect(result.current.displayOptionsSelected).not.toContain([SHOW_DATA_LINKS]);
  });

  it('calls onSelect callback with updated options and selected option', () => {
    const { result } = renderHook(() => useDisplayOptionsState({ defaultSelected: [], onSelected: mockOnSelected }));
    const { selectDisplayOptions } = result.current;

    act(() => selectDisplayOptions('option1'));
    expect(mockOnSelected).toHaveBeenCalledWith(['option1'], 'option1');
  });
});

describe('DisplayOptions', () => {
  it('renders Select component with correct props', () => {
    const { getByRole, getByText } = render(
      <DisplayOptions defaultSelected={defaultSelected} options={[options]} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    expect(selectElement).toBeInTheDocument();

    const placeholderTextElement = getByText(Labels.Display);
    expect(placeholderTextElement).toBeInTheDocument();
  });

  it('renders options correctly', async () => {
    const { getByRole, getByText } = render(
      <DisplayOptions defaultSelected={defaultSelected} options={[options]} onSelected={mockOnSelected} />
    );

    const selectElement = getByRole('button');
    await eventUser.click(selectElement);

    options.items.forEach((option) => {
      const optionElement = getByText(option.label);
      expect(optionElement).toBeInTheDocument();
    });
  });

  it('calls selectDisplayOption function on selecting an option', async () => {
    const { getByRole, getByText } = render(
      <DisplayOptions defaultSelected={defaultSelected} options={[options]} onSelected={mockOnSelected} />
    );
    const selectElement = getByRole('button');
    await eventUser.click(selectElement);

    const optionToSelect = getByText('Option 1');
    await eventUser.click(optionToSelect);

    expect(mockOnSelected).toHaveBeenCalledWith(['1'], '1');
  });
});
