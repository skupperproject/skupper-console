import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { getAllConnectors, getAllHttpRequests, getAllListeners, getAllTcpConnections } from '../src/API/REST.endpoints';
import { TcpStatus } from '../src/API/REST.enum';
import useServiceData from '../src/pages/Services/hooks/useServiceData';

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: vi.fn(),
  useQuery: vi.fn()
}));

const makeQueryData = (count: number) => ({ timeRangeCount: count, results: [] });

const serviceId = 'adr-026fd79c9d4f5db4';

describe('useServiceData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include the service identity in each query key', () => {
    (useSuspenseQuery as Mock).mockReturnValue({
      data: {
        results: {
          identity: serviceId,
          name: 'productcatalogservice',
          observedApplicationProtocols: ['http2']
        }
      }
    });
    (useQuery as Mock).mockReturnValue({ data: makeQueryData(0) });

    renderHook(() => useServiceData(serviceId));

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [getAllHttpRequests(), { limit: 0, routingKey: 'productcatalogservice' }],
      queryFn: expect.any(Function),
      enabled: expect.any(Boolean),
      refetchInterval: expect.any(Number)
    });
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [getAllTcpConnections(), { limit: 0, state: TcpStatus.Active, routingKey: 'productcatalogservice' }],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Number)
    });
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [
        getAllTcpConnections(),
        { limit: 0, state: TcpStatus.Terminated, routingKey: 'productcatalogservice' }
      ],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Number)
    });
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [getAllListeners(), { limit: 0, serviceId }],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Number)
    });
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [getAllConnectors(), { limit: 0, serviceId }],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Number)
    });
  });

  it('should return 0 active connections for emailservice', () => {
    (useSuspenseQuery as Mock).mockReturnValue({
      data: {
        results: {
          identity: 'adr-5193d597cb3d8442',
          name: 'emailservice',
          observedApplicationProtocols: []
        }
      }
    });
    (useQuery as Mock).mockReturnValue({ data: makeQueryData(0) });

    const { result } = renderHook(() => useServiceData('adr-5193d597cb3d8442'));

    expect(result.current.summary.activeConnectionCount).toBe(0);
  });

  it('should return 2 active connections for productcatalogservice', () => {
    (useSuspenseQuery as Mock).mockReturnValue({
      data: {
        results: {
          identity: serviceId,
          name: 'productcatalogservice',
          observedApplicationProtocols: ['http2']
        }
      }
    });
    (useQuery as Mock).mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      const params = queryKey[1] as Record<string, unknown>;

      if (queryKey[0] === getAllTcpConnections() && params?.state === TcpStatus.Active) {
        return { data: makeQueryData(2) };
      }

      return { data: makeQueryData(0) };
    });

    const { result } = renderHook(() => useServiceData(serviceId));

    expect(result.current.summary.activeConnectionCount).toBe(2);
  });
});
