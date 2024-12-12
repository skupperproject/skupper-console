import { act, renderHook } from '@testing-library/react';

import { SkSelectTypeHeadWithCheckboxUseData } from '../src/core/components/SkSelectTypeHeadWithCheckbox/SkSelectTypeHeadWithCheckboxUseData';

describe('SkSelectTypeHeadWithCheckboxUseData', () => {
  const mockOnSelected = jest.fn();
  const initOptions = [
    { key: '1', value: '1', label: 'Service 1' },
    { key: '2', value: '2', label: 'Service 2' },
    { key: '3', value: '3', label: 'Service 3' }
  ];

  it('should toggle service menu correctly', () => {
    const { result } = renderHook(() =>
      SkSelectTypeHeadWithCheckboxUseData({ initIdsSelected: [], initOptions, onSelected: mockOnSelected })
    );

    expect(result.current.isOpen).toBe(false);
    act(() => {
      result.current.toggleServiceMenu();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('should select and deselect services correctly', () => {
    const { result } = renderHook(() =>
      SkSelectTypeHeadWithCheckboxUseData({ initIdsSelected: [], initOptions, onSelected: mockOnSelected })
    );

    expect(result.current.selected).toEqual([]);
    act(() => {
      result.current.selectService('1');
    });
    expect(result.current.selected).toEqual(['1']);

    act(() => {
      result.current.selectService('1');
    });
    expect(result.current.selected).toEqual([]);

    act(() => {
      result.current.selectService('2');
    });
    expect(result.current.selected).toEqual(['2']);
  });

  it('should select all services correctly', () => {
    const { result } = renderHook(() =>
      SkSelectTypeHeadWithCheckboxUseData({ initIdsSelected: [], initOptions, onSelected: mockOnSelected })
    );

    expect(result.current.selected).toEqual([]);
    act(() => {
      result.current.selectAllServices();
    });
    expect(result.current.selected).toEqual([]);

    act(() => {
      result.current.selectAllServices();
    });
    expect(result.current.selected).toEqual([]);
  });

  it('should handle menu arrow keys (ArrowUp and ArrowDown)', () => {
    const { result } = renderHook(() =>
      SkSelectTypeHeadWithCheckboxUseData({ initIdsSelected: [], initOptions, onSelected: mockOnSelected })
    );

    act(() => {
      result.current.toggleServiceMenu();
    });

    act(() => {
      result.current.handleMenuArrowKeys('ArrowDown');
    });

    expect(result.current.focusedItemIndex).toBe(0);
    expect(result.current.activeItem).toBe('select-multi-typeahead-checkbox-1');

    act(() => {
      result.current.handleMenuArrowKeys('ArrowDown');
    });

    expect(result.current.focusedItemIndex).toBe(1);
    expect(result.current.activeItem).toBe('select-multi-typeahead-checkbox-2');

    act(() => {
      result.current.handleMenuArrowKeys('ArrowUp');
    });

    expect(result.current.focusedItemIndex).toBe(0);
    expect(result.current.activeItem).toBe('select-multi-typeahead-checkbox-1');
  });

  it('should handle input key down events correctly', () => {
    const { result } = renderHook(() =>
      SkSelectTypeHeadWithCheckboxUseData({ initIdsSelected: [], initOptions, onSelected: mockOnSelected })
    );

    act(() => {
      result.current.onInputKeyDown({ key: 'Enter' });
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onInputKeyDown({ key: 'Tab' });
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.onInputKeyDown({ key: 'Escape' });
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleServiceMenu();
    });

    act(() => {
      result.current.onInputKeyDown({ key: 'ArrowDown' });
    });
    expect(result.current.focusedItemIndex).toBe(0);
    expect(result.current.activeItem).toBe('select-multi-typeahead-checkbox-1');

    act(() => {
      result.current.onInputKeyDown({ key: 'ArrowUp' });
    });
    expect(result.current.focusedItemIndex).toBe(2);
    expect(result.current.activeItem).toBe('select-multi-typeahead-checkbox-3');

    act(() => {
      result.current.onInputKeyDown({ key: 'Enter' });
    });
    expect(result.current.selected).toEqual(['3']);
    expect(mockOnSelected).toHaveBeenCalledWith(['3']);

    act(() => {
      result.current.onInputKeyDown({ key: 'No existing key' });
    });
    //keep the previous value
    expect(result.current.isOpen).toBe(true);
  });
});
