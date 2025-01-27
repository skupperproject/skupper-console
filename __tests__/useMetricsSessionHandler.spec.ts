import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

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
vi.mock('../src/core/utils/persistData', () => ({
  getDataFromSession: vi.fn(),
  storeDataToSession: vi.fn()
}));

describe('useMetricSessionHandlers', () => {
  const id = 'test-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve selectedFilters and visibleMetrics from session', () => {
    const mockFilters: QueryMetricsParams = mockQueryMetricsParams;
    const mockVisibleMetrics = mockExpandedMetricSections;

    (getDataFromSession as Mock).mockImplementation((key: string) =>
      key.includes('metric-filters') ? mockFilters : mockVisibleMetrics
    );

    const { result } = renderHook(() => useMetricSessionHandlers(id));

    expect(result.current.selectedFilters).toEqual(mockFilters);
    expect(getDataFromSession).toHaveBeenCalledTimes(1);
  });

  it('should store selectedFilters to session', () => {
    const mockFilters: QueryMetricsParams = mockQueryMetricsParams;
    const { result } = renderHook(() => useMetricSessionHandlers(id));

    act(() => {
      result.current.setSelectedFilters(mockFilters);
    });

    expect(storeDataToSession).toHaveBeenCalledWith(`metric-filters-${id}`, mockFilters);
  });
});
