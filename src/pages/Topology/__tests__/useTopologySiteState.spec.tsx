import { renderHook, act } from '@testing-library/react';

import useTopologySiteState from '../components/useTopologySiteState';
import { SHOW_ROUTER_LINKS } from '../Topology.constants';

const DISPLAY_OPTIONS = 'display-site-options';

describe('useTopologySiteToolbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default display options', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: undefined }));

    expect(result.current.displayOptionsSelected).toEqual([SHOW_ROUTER_LINKS]);
  });

  it('should handle display options selection', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: undefined }));
    const newDisplayOptions = [SHOW_ROUTER_LINKS, 'new_option'];

    act(() => {
      result.current.handleDisplaySelect(newDisplayOptions);
    });

    expect(result.current.displayOptionsSelected).toEqual(newDisplayOptions);
    expect(localStorage.getItem(DISPLAY_OPTIONS)).toEqual(JSON.stringify(newDisplayOptions));
  });

  it('sshould initialize the component with the correct selected id', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: 'site_id' }));
    expect(result.current.idSelected).toEqual('site_id');
  });

  it('should update the selected ID when a site is selected', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: undefined }));

    act(() => {
      result.current.handleSiteSelected('site_id');
    });

    expect(result.current.idSelected).toEqual('site_id');
  });

  it('should handle show only neighbours', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: undefined }));

    act(() => {
      result.current.handleShowOnlyNeighbours(true);
    });

    expect(result.current.showOnlyNeighbours).toBe(true);
  });

  it('should handle move to node selection', () => {
    const { result } = renderHook(() => useTopologySiteState({ id: undefined }));

    act(() => {
      result.current.handleMoveToNodeSelectedChecked(true);
    });

    expect(result.current.moveToNodeSelected).toBe(true);
  });
});
