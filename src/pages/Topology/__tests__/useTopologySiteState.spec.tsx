import { renderHook, act } from '@testing-library/react';

import useTopologyState from '../components/useTopologyState';
import { TopologyController } from '../services';
import { SHOW_ROUTER_LINKS } from '../Topology.constants';

describe('useTopologySiteState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty display options', () => {
    const { result } = renderHook(() => useTopologyState({ ids: undefined }));

    expect(result.current.displayOptionsSelected).toEqual([]);
  });

  it('should initialize with default display options', () => {
    const { result } = renderHook(() =>
      useTopologyState({ ids: undefined, initDisplayOptionsEnabled: [SHOW_ROUTER_LINKS] })
    );

    expect(result.current.displayOptionsSelected).toEqual([SHOW_ROUTER_LINKS]);
  });

  it('should handle display options selection', () => {
    const { result } = renderHook(() => useTopologyState({ ids: undefined, displayOptionsEnabledKey: 'test-key' }));
    const newDisplayOptions = ['new_option'];

    act(() => {
      result.current.handleDisplaySelected(newDisplayOptions);
    });

    expect(result.current.displayOptionsSelected).toEqual(newDisplayOptions);
    expect(localStorage.getItem('test-key')).toEqual(JSON.stringify(newDisplayOptions));
  });

  it('sshould initialize the component with the correct selected id', () => {
    const { result } = renderHook(() =>
      useTopologyState({ ids: TopologyController.transformStringIdsToIds('site_id') })
    );
    expect(result.current.idsSelected).toEqual(['site_id']);
  });

  it('should update the selected ID when a site is selected', () => {
    const { result } = renderHook(() => useTopologyState({ ids: undefined }));

    act(() => {
      result.current.handleSelected(TopologyController.transformStringIdsToIds('site_id'));
    });

    expect(result.current.idsSelected).toEqual(['site_id']);
  });
});
