import { renderHook, act } from '@testing-library/react';

import useServiceState from '../../../src/pages/Topology/hooks/useTopologyServiceState';

describe('useTopologyServiceState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with routing keys selected', () => {
    const { result } = renderHook(() => useServiceState(['a', 'b']));

    expect(result.current.serviceIdsSelected).toEqual(['a', 'b']);
  });

  it('should handle handleServiceSelected', () => {
    const { result } = renderHook(() => useServiceState());
    const selected = ['a', 'b'];

    act(() => {
      result.current.handleServiceSelected(selected);
    });

    expect(result.current.serviceIdsSelected).toEqual(selected);
  });

  it('should handle getServiceIdsFromLocalStorage', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => '[1,2]');

    const { result } = renderHook(() => useServiceState());

    act(() => {
      result.current.getServiceIdsFromLocalStorage();
    });

    expect(result.current.serviceIdsSelected).toEqual([1, 2]);
  });
});
