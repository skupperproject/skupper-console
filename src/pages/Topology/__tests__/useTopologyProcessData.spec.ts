import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useTopologyProcessData from '../components/useTopologyProcessData';

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: jest.fn()
}));

describe('useTopologySiteData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter the data based on idSelected', async () => {
    const mockProcesses = [{ identity: 'process1' }, { identity: 'process2' }, { identity: 'process3' }];
    const mockProcessesPairs = [
      { sourceId: 'process1', destinationId: 'process2' },
      { sourceId: 'process2', destinationId: 'process3' }
    ];
    const mockMetrics = { bytes: 1000 };

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockProcesses },
      { data: mockProcessesPairs },
      { data: mockMetrics }
    ]);

    const { result } = renderHook(() =>
      useTopologyProcessData({
        idSelected: ['process1'],
        showBytes: true,
        showByteRate: true,
        showLatency: true
      })
    );

    await waitFor(() => {
      expect(result.current.processes).toEqual([{ identity: 'process1' }, { identity: 'process2' }]);
      expect(result.current.processesPairs).toEqual([{ sourceId: 'process1', destinationId: 'process2' }]);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  it('should handle empty idSelected', async () => {
    const mockSites = [{ identity: 'process1' }, { identity: 'process2' }];
    const mockSitesPairs = [{ sourceId: 'process1', destinationId: 'process2' }];
    const mockMetrics = { bytes: 1000 };

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockSites },
      { data: mockSitesPairs },
      { data: mockMetrics }
    ]);

    const { result } = renderHook(() =>
      useTopologyProcessData({
        idSelected: [],
        showBytes: true,
        showByteRate: true,
        showLatency: true
      })
    );

    await waitFor(() => {
      expect(result.current.processes).toEqual(mockSites);
      expect(result.current.processesPairs).toEqual(mockSitesPairs);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  it('should handle idSelected with non-matching elements', async () => {
    const mockProcesses = [{ identity: 'process1' }, { identity: 'process2' }];
    const mockProcessesPairs = [{ sourceId: 'process1', destinationId: 'process2' }];
    const mockMetrics = { bytes: 1000 };

    (useSuspenseQueries as jest.Mock).mockReturnValue([
      { data: mockProcesses },
      { data: mockProcessesPairs },
      { data: mockMetrics }
    ]);

    const { result } = renderHook(() =>
      useTopologyProcessData({
        idSelected: ['process3'],
        showBytes: true,
        showByteRate: true,
        showLatency: true
      })
    );

    await waitFor(() => {
      expect(result.current.processes).toEqual([]);
      expect(result.current.processesPairs).toEqual([]);
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });
});
