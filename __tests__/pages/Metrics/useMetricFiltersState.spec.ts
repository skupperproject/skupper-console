import { act } from 'react';

import { renderHook } from '@testing-library/react';

import { Protocols } from '../../../src/API/REST.enum';
import useMetricFiltersState from '../../../src/pages/shared/Metrics/hooks/useMetricFiltersState';
import { QueryMetricsParams } from '../../../src/types/Metrics.interfaces';

describe('useMetricFiltersState', () => {
  const defaultMetricFilterValues: QueryMetricsParams = {
    sourceSite: 'site1',
    destSite: 'site2',
    duration: 1000
  };

  it('should initialize with default metric filter values', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    expect(result.current.selectedFilters).toEqual(defaultMetricFilterValues);
  });

  it('should update source site when handleSelectSourceSite is called', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    act(() => {
      result.current.handleSelectSourceSite('newSourceSite');
    });

    expect(result.current.selectedFilters.sourceSite).toEqual('newSourceSite');
    expect(result.current.selectedFilters.sourceProcess).toBeUndefined(); // As the process should be reset
  });

  it('should update destination site when handleSelectDestSite is called', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    act(() => {
      result.current.handleSelectDestSite('newDestSite');
    });

    expect(result.current.selectedFilters.destSite).toEqual('newDestSite');
    expect(result.current.selectedFilters.destProcess).toBeUndefined(); // As the process should be reset
  });

  it('should update source process when handleSelectSourceProcess is called', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    act(() => {
      result.current.handleSelectSourceProcess('newSourceProcess');
    });

    expect(result.current.selectedFilters.sourceProcess).toEqual('newSourceProcess');
  });

  it('should update destination process when handleSelectDestProcess is called', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    act(() => {
      result.current.handleSelectDestProcess('newDestProcess');
    });

    expect(result.current.selectedFilters.destProcess).toEqual('newDestProcess');
  });

  it('should update protocol when handleSelectProtocol is called', () => {
    const { result } = renderHook(() => useMetricFiltersState({ defaultMetricFilterValues }));

    act(() => {
      result.current.handleSelectProtocol(Protocols.Tcp);
    });

    expect(result.current.selectedFilters.protocol).toEqual(Protocols.Tcp);
  });

  it('should update time interval when handleSelectTimeInterval is called', () => {
    const onSelectFiltersMock = jest.fn();

    const { result } = renderHook(() =>
      useMetricFiltersState({
        defaultMetricFilterValues,
        onSelectFilters: onSelectFiltersMock
      })
    );

    const duration = 86400;
    act(() => {
      result.current.handleSelectTimeInterval(86400);
    });

    expect(result.current.selectedFilters.duration).toEqual(duration);

    expect(onSelectFiltersMock).toHaveBeenCalledWith({
      ...defaultMetricFilterValues,
      duration
    });
  });

  it('should call onSelectFilters when a filter is updated', () => {
    const onSelectFiltersMock = jest.fn();
    const { result } = renderHook(() =>
      useMetricFiltersState({ defaultMetricFilterValues, onSelectFilters: onSelectFiltersMock })
    );

    act(() => {
      result.current.handleSelectSourceSite('newSourceSite');
    });

    expect(onSelectFiltersMock).toHaveBeenCalledWith({
      ...defaultMetricFilterValues,
      sourceSite: 'newSourceSite',
      sourceProcess: undefined
    });
  });
});
