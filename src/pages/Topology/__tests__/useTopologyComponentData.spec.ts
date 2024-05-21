import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useTopologyComponentData from '../components/useTopologyComponentData';

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: jest.fn()
}));

describe('useTopologyComponentData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const components = { results: [{ identity: 'component1' }, { identity: 'component2' }, { identity: 'component3' }] };
  const componentPairs = [
    { sourceId: 'component1', destinationId: 'component2' },
    { sourceId: 'component2', destinationId: 'component3' }
  ];

  it('should filter the data based on idSelected', async () => {
    (useSuspenseQueries as jest.Mock).mockReturnValue([{ data: components }, { data: componentPairs }]);

    const { result } = renderHook(() =>
      useTopologyComponentData({
        idSelected: ['component1']
      })
    );

    await waitFor(() => {
      expect(result.current.components).toEqual([components.results[0], components.results[1]]);
      expect(result.current.componentsPairs).toEqual([componentPairs[0]]);
    });
  });

  it('should handle empty idSelected', async () => {
    (useSuspenseQueries as jest.Mock).mockReturnValue([{ data: components }, { data: componentPairs }]);

    const { result } = renderHook(() => useTopologyComponentData({}));

    await waitFor(() => {
      expect(result.current.components).toEqual(components.results);
      expect(result.current.componentsPairs).toEqual(componentPairs);
    });
  });
});
