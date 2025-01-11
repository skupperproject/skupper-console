import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useTopologyComponentData from '../src/pages/Topology/hooks/useTopologyComponentData';

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: jest.fn()
}));

describe('useTopologyComponentData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const components = { results: [{ identity: 'component1' }, { identity: 'component2' }, { identity: 'component3' }] };
  const componentPairs = {
    results: [
      { sourceId: 'component1', destinationId: 'component2' },
      { sourceId: 'component2', destinationId: 'component3' }
    ]
  };

  it('should call useTopologyComponentData', async () => {
    (useSuspenseQueries as jest.Mock).mockReturnValue([{ data: components }, { data: componentPairs }]);

    const { result } = renderHook(() => useTopologyComponentData());

    await waitFor(() => {
      expect(result.current.components).toEqual(components.results);
      expect(result.current.componentsPairs).toEqual(componentPairs.results);
    });
  });
});
