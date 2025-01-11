import { act } from 'react';

import { renderHook } from '@testing-library/react';

import { Direction } from '../src/API/REST.enum';
import { Labels } from '../src/config/labels';
import { getDataFromSession, storeDataToSession } from '../src/core/utils/persistData';
import { useMetricSessionHandlers } from '../src/pages/shared/Metrics/hooks/useMetricsSessionHandler';
import { QueryMetricsParams, ExpandedMetricSections } from '../src/types/Metrics.interfaces';

const mockQueryMetricsParams: QueryMetricsParams = {
  sourceSite: 'SiteA',
  destSite: 'SiteB',
  sourceProcess: 'ProcessA',
  destProcess: 'ProcessB',
  sourceComponent: 'ComponentA',
  destComponent: 'ComponentB',
  service: 'ServiceA',
  start: 1620000000,
  end: 1620003600,
  duration: 3600,
  direction: Direction.Incoming
};

const mockExpandedMetricSections: ExpandedMetricSections = {
  byterate: true,
  [Labels.LatencyIn]: false,
  [Labels.LatencyOut]: false,
  request: true,
  response: true,
  connection: false
};

// Mock the utility functions
jest.mock('../src/core/utils/persistData', () => ({
  getDataFromSession: jest.fn(),
  storeDataToSession: jest.fn()
}));

describe('useMetricSessionHandlers', () => {
  const id = 'test-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined for visibleMetrics if session data is missing', () => {
    (getDataFromSession as jest.Mock).mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useMetricSessionHandlers(id));
    expect(result.current.openSections).toBeUndefined();
  });

  it('should retrieve selectedFilters and visibleMetrics from session', () => {
    const mockFilters: QueryMetricsParams = mockQueryMetricsParams;
    const mockVisibleMetrics = mockExpandedMetricSections;

    (getDataFromSession as jest.Mock).mockImplementation((key: string) =>
      key.includes('metric-filters') ? mockFilters : mockVisibleMetrics
    );

    const { result } = renderHook(() => useMetricSessionHandlers(id));

    expect(result.current.selectedFilters).toEqual(mockFilters);
    expect(result.current.openSections).toEqual(mockVisibleMetrics);
    expect(getDataFromSession).toHaveBeenCalledTimes(2);
  });

  it('should store selectedFilters to session', () => {
    const mockFilters: QueryMetricsParams = mockQueryMetricsParams;
    const { result } = renderHook(() => useMetricSessionHandlers(id));

    act(() => {
      result.current.setSelectedFilters(mockFilters);
    });

    expect(storeDataToSession).toHaveBeenCalledWith(`metric-filters-${id}`, mockFilters);
  });

  it('should store visibleMetrics to session', () => {
    const mockVisibleMetrics = mockExpandedMetricSections;
    const { result } = renderHook(() => useMetricSessionHandlers(id));

    act(() => {
      result.current.setOpenSections(mockVisibleMetrics);
    });

    expect(storeDataToSession).toHaveBeenCalledWith(`metric-sections-${id}`, mockVisibleMetrics);
  });
});
