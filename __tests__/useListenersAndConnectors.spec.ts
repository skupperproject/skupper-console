import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import listenersData from '../mocks/data//LISTENERS.json';
import connectorsData from '../mocks/data/CONNECTORS.json';
import { getAllConnectors, getAllListeners } from '../src/API/REST.endpoints';
import useListenersAndConnectorsData from '../src/pages/Services/hooks/useListenersAndConnectorsData';

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: vi.fn()
}));

describe('useListenersAndConnectorsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useSuspenseQueries as Mock).mockReturnValue([
      { data: { results: listenersData.results, timeRangeCount: listenersData.results.length } },
      { data: { results: connectorsData.results, timeRangeCount: connectorsData.results.length } }
    ]);
  });

  it('should return listeners and connectors data', () => {
    const serviceId = 'adr-7375c1d0dcc0c921';
    const { result } = renderHook(() => useListenersAndConnectorsData(serviceId));

    expect(useSuspenseQueries).toHaveBeenCalledWith({
      queries: [
        {
          queryKey: [getAllListeners(), serviceId],
          queryFn: expect.any(Function),
          refetchInterval: expect.any(Number)
        },
        {
          queryKey: [getAllConnectors(), serviceId],
          queryFn: expect.any(Function),
          refetchInterval: expect.any(Number)
        }
      ]
    });

    expect(result.current).toEqual({
      listeners: listenersData.results,
      connectors: connectorsData.results,
      summary: {
        listenerCount: listenersData.results.length,
        connectorCount: connectorsData.results.length
      }
    });
  });

  it('should handle different serviceId', () => {
    const serviceId = 'adr-00ffe0b268c6eae4';
    renderHook(() => useListenersAndConnectorsData(serviceId));

    expect(useSuspenseQueries).toHaveBeenCalledWith(
      expect.objectContaining({
        queries: expect.arrayContaining([
          expect.objectContaining({
            queryKey: expect.arrayContaining([expect.any(String), serviceId])
          })
        ])
      })
    );
  });

  it('should handle missing timeRangeCount', () => {
    (useSuspenseQueries as Mock).mockReturnValue([
      { data: { results: listenersData.results } },
      { data: { results: connectorsData.results } }
    ]);

    const serviceId = 'adr-7375c1d0dcc0c921';
    const { result } = renderHook(() => useListenersAndConnectorsData(serviceId));

    expect(result.current.summary).toEqual({
      listenerCount: 0,
      connectorCount: 0
    });
  });
});
