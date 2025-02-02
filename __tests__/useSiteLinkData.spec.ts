import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, Mock, beforeEach, vi } from 'vitest';

import { getAllLinks } from '../src/API/REST.endpoints';
import { UPDATE_INTERVAL } from '../src/config/reactQuery';
import { useSiteLinksData } from '../src/pages/Sites/hooks/useSiteLinksData';

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: vi.fn()
}));

describe('useSiteLinksData', () => {
  const mockLocalLinks = {
    results: [
      { id: 'link1', sourceSiteId: 'site1', destinationSiteId: 'site2' },
      { id: 'link2', sourceSiteId: 'site1', destinationSiteId: 'site3' }
    ]
  };

  const mockRemoteLinks = {
    results: [
      { id: 'link3', sourceSiteId: 'site2', destinationSiteId: 'site1' },
      { id: 'link4', sourceSiteId: 'site3', destinationSiteId: 'site1' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSuspenseQueries as Mock).mockReturnValue([{ data: mockLocalLinks }, { data: mockRemoteLinks }]);
  });

  it('should fetch links data with correct parameters', () => {
    const siteId = 'site1';
    const { result } = renderHook(() => useSiteLinksData(siteId));

    expect(useSuspenseQueries).toHaveBeenCalledWith({
      queries: [
        {
          queryKey: [getAllLinks(), { sourceSiteId: siteId }],
          queryFn: expect.any(Function),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [getAllLinks(), { destinationSiteId: siteId }],
          queryFn: expect.any(Function),
          refetchInterval: UPDATE_INTERVAL
        }
      ]
    });

    expect(result.current).toEqual({
      links: mockLocalLinks.results,
      remoteLinks: mockRemoteLinks.results
    });
  });

  it('should handle empty results', () => {
    (useSuspenseQueries as Mock).mockReturnValue([{ data: { results: [] } }, { data: { results: [] } }]);

    const siteId = 'site1';
    const { result } = renderHook(() => useSiteLinksData(siteId));

    expect(result.current).toEqual({
      links: [],
      remoteLinks: []
    });
  });

  it('should pass different query params for source and destination', () => {
    const siteId = 'site1';
    renderHook(() => useSiteLinksData(siteId));

    const callArguments = (useSuspenseQueries as Mock).mock.calls[0][0];

    const [sourceQuery, destQuery] = callArguments.queries;
    expect(sourceQuery.queryKey[1]).toEqual({ sourceSiteId: siteId });
    expect(destQuery.queryKey[1]).toEqual({ destinationSiteId: siteId });
  });
});
