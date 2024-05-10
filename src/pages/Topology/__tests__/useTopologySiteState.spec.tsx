import { renderHook, act } from '@testing-library/react';

import useTopologyState from '../components/useTopologyState';
import { TopologyController } from '../services';
import { SHOW_ROUTER_LINKS, SHOW_SITE_KEY } from '../Topology.constants';

describe('useTopologySiteState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty display options', () => {
    const { result } = renderHook(() => useTopologyState({ id: undefined }));

    expect(result.current.displayOptionsSelected).toEqual([]);
  });

  it('should initialize with default display options', () => {
    const { result } = renderHook(() =>
      useTopologyState({ id: undefined, initDisplayOptionsEnabled: [SHOW_ROUTER_LINKS, SHOW_SITE_KEY] })
    );

    expect(result.current.displayOptionsSelected).toEqual([SHOW_ROUTER_LINKS, SHOW_SITE_KEY]);
  });

  it('should handle display options selection', () => {
    const { result } = renderHook(() => useTopologyState({ id: undefined, displayOptionsEnabledKey: 'test-key' }));
    const newDisplayOptions = ['new_option'];

    act(() => {
      result.current.handleDisplaySelected(newDisplayOptions);
    });

    expect(result.current.displayOptionsSelected).toEqual(newDisplayOptions);
    expect(localStorage.getItem('test-key')).toEqual(JSON.stringify(newDisplayOptions));
  });

  it('sshould initialize the component with the correct selected id', () => {
    const { result } = renderHook(() =>
      useTopologyState({ id: TopologyController.transformStringIdsToIds('site_id') })
    );
    expect(result.current.idSelected).toEqual(['site_id']);
  });

  it('should update the selected ID when a site is selected', () => {
    const { result } = renderHook(() => useTopologyState({ id: undefined }));

    act(() => {
      result.current.handleSelected(TopologyController.transformStringIdsToIds('site_id'));
    });

    expect(result.current.idSelected).toEqual(['site_id']);
  });

  it('should handle show only neighbours', () => {
    const { result } = renderHook(() => useTopologyState({ id: undefined }));

    act(() => {
      result.current.handleShowOnlyNeighbours(true);
    });

    expect(result.current.showOnlyNeighbours).toBe(true);
  });

  it('should handle move to node selection', () => {
    const { result } = renderHook(() => useTopologyState({ id: undefined }));

    act(() => {
      result.current.handleMoveToNodeSelectedChecked(true);
    });

    expect(result.current.moveToNodeSelected).toBe(true);
  });
});
