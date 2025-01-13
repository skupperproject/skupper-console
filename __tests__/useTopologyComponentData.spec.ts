import { useSuspenseQueries } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import useTopologyComponentData from '../src/pages/Topology/hooks/useTopologyComponentData';

vi.mock('@tanstack/react-query', () => ({
  useSuspenseQueries: vi.fn()
}));

describe('useTopologyComponentData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const components = { results: [{ identity: 'component1' }, { identity: 'component2' }, { identity: 'component3' }] };
  const componentPairs = {
    results: [
      { sourceId: 'component1', destinationId: 'component2' },
      { sourceId: 'component2', destinationId: 'component3' }
    ]
  };

  it('should call useTopologyComponentData', async () => {
    (useSuspenseQueries as Mock).mockReturnValue([{ data: components }, { data: componentPairs }]);

    const { result } = renderHook(() => useTopologyComponentData());

    await waitFor(() => {
      expect(result.current.components).toEqual(components.results);
      expect(result.current.componentsPairs).toEqual(componentPairs.results);
    });
  });
});
