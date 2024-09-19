import { act } from 'react';

import { renderHook } from '@testing-library/react';

import { Protocols } from '@API/REST.enum';

import useMetricFiltersState from '../../../src/pages/shared/Metrics/hooks/useMetricFiltersState';
import { QueryMetricsParams } from '../../../src/types/Metrics.interfaces';

describe('useMetricFiltersState', () => {
  const defaultMetricFilterValues: QueryMetricsParams = {
    sourceSite: 'site1',
    destSite: 'site2',
    protocol: Protocols.Tcp,
    start: 0,
    end: 100,
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

    const newTimeInterval = { start: 1609545600, end: 1609632000, duration: 86400 };
    act(() => {
      result.current.handleSelectTimeInterval(newTimeInterval);
    });

    expect(result.current.selectedFilters.start).toEqual(newTimeInterval.start);
    expect(result.current.selectedFilters.end).toEqual(newTimeInterval.end);
    expect(result.current.selectedFilters.duration).toEqual(newTimeInterval.duration);

    expect(onSelectFiltersMock).toHaveBeenCalledWith({
      ...defaultMetricFilterValues,
      ...newTimeInterval
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
