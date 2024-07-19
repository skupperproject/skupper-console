import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useTopologySiteData from '../components/useTopologySiteData';

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: jest.fn()
}));

describe('useTopologySiteData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the expected data when showDataLink, showBytes, showByteRate, and showLatency are true', async () => {
    const mockSites = [{ identity: 'site1' }, { identity: 'site2' }];
    const mockSitesPairs = [{ sourceId: 'site1', destinationId: 'site2' }];
    const mockMetrics = { bytes: 1000 };

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockSites },
      { data: null },
      { data: mockSitesPairs },
      { data: mockMetrics }
    ]);

    const { result } = renderHook(() =>
      useTopologySiteData({
        showDataLink: true,
        showBytes: true,
        showByteRate: true,
        showLatency: true
      })
    );

    await waitFor(() => {
      expect(result.current.sites).toEqual(mockSites);
      expect(result.current.routerLinks).toEqual(null);
      expect(result.current.sitesPairs).toEqual(mockSitesPairs);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  it('should handle case when showDataLink is false', async () => {
    const mockSites = [{ identity: 'site1' }, { identity: 'site2' }];
    const mockRouterLinks = [
      {
        identity: 'router1'
      },
      {
        identity: 'router2'
      }
    ];

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockSites },
      { data: mockRouterLinks },
      { data: null },
      { data: null }
    ]);

    const { result } = renderHook(() =>
      useTopologySiteData({
        showDataLink: false,
        showBytes: false,
        showByteRate: false,
        showLatency: false
      })
    );

    await waitFor(() => {
      expect(result.current.sites).toEqual(mockSites);
      expect(result.current.routerLinks).toBe(mockRouterLinks);
      expect(result.current.sitesPairs).toBeNull();
      expect(result.current.metrics).toBeNull();
    });
  });

  it('should handle case when showDataLink is true and other params are false', async () => {
    const mockSites = [{ identity: 'site1' }, { identity: 'site2' }];
    const mockSitesPairs = [{ sourceId: 'site1', destinationId: 'site2' }];

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockSites },
      { data: null },
      { data: mockSitesPairs },
      { data: null }
    ]);

    const { result } = renderHook(() =>
      useTopologySiteData({
        showDataLink: true,
        showBytes: false,
        showByteRate: false,
        showLatency: false
      })
    );

    await waitFor(() => {
      expect(result.current.sites).toEqual(mockSites);
      expect(result.current.routerLinks).toBeNull();
      expect(result.current.sitesPairs).toEqual(mockSitesPairs);
      expect(result.current.metrics).toBeNull();
    });
  });
});
