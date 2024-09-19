import { act } from 'react';

import { renderHook } from '@testing-library/react';

import { useDisplayOptionsState } from '../../../src/pages/Topology/hooks/useDisplayOptionsState';
import {
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_METRIC_DISTRIBUTION,
  SHOW_LINK_METRIC_VALUE,
  SHOW_ROUTER_LINKS
} from '../../../src/pages/Topology/Topology.constants';

describe('useDisplayOptionsState', () => {
  const onSelectedMock = jest.fn();

  beforeEach(() => {
    onSelectedMock.mockClear();
  });

  test('should handle the site link metrics options properly', () => {
    const { result } = renderHook(() => useDisplayOptionsState({ defaultSelected: [], onSelected: onSelectedMock }));

    act(() => {
      result.current.selectDisplayOptions(SHOW_LINK_BYTES);
    });

    expect(result.current.displayOptionsSelected).toEqual([SHOW_LINK_BYTES, SHOW_LINK_METRIC_DISTRIBUTION]);
    expect(onSelectedMock).toHaveBeenCalledWith([SHOW_LINK_BYTES, SHOW_LINK_METRIC_DISTRIBUTION], SHOW_LINK_BYTES);

    act(() => {
      result.current.selectDisplayOptions(SHOW_LINK_BYTERATE);
    });
    expect(result.current.displayOptionsSelected).toEqual([SHOW_LINK_METRIC_DISTRIBUTION, SHOW_LINK_BYTERATE]);
    expect(onSelectedMock).toHaveBeenCalledWith(
      [SHOW_LINK_METRIC_DISTRIBUTION, SHOW_LINK_BYTERATE],
      SHOW_LINK_BYTERATE
    );

    act(() => {
      result.current.selectDisplayOptions(SHOW_LINK_LATENCY);
    });
    expect(result.current.displayOptionsSelected).toEqual([SHOW_LINK_METRIC_DISTRIBUTION, SHOW_LINK_LATENCY]);
    expect(onSelectedMock).toHaveBeenCalledWith([SHOW_LINK_METRIC_DISTRIBUTION, SHOW_LINK_LATENCY], SHOW_LINK_LATENCY);

    act(() => {
      result.current.selectDisplayOptions(SHOW_LINK_METRIC_VALUE);
    });
    expect(result.current.displayOptionsSelected).toEqual([
      SHOW_LINK_METRIC_DISTRIBUTION,
      SHOW_LINK_LATENCY,
      SHOW_LINK_METRIC_VALUE
    ]);
    expect(onSelectedMock).toHaveBeenCalledWith(
      [SHOW_LINK_METRIC_DISTRIBUTION, SHOW_LINK_LATENCY, SHOW_LINK_METRIC_VALUE],
      SHOW_LINK_METRIC_VALUE
    );
  });

  test('should toggle between SHOW_DATA_LINKS and SHOW_ROUTER_LINKS', () => {
    const { result } = renderHook(() => useDisplayOptionsState({ defaultSelected: [], onSelected: onSelectedMock }));

    act(() => {
      result.current.selectDisplayOptions(SHOW_DATA_LINKS);
    });
    expect(result.current.displayOptionsSelected).toEqual([SHOW_DATA_LINKS]);
    expect(onSelectedMock).toHaveBeenCalledWith([SHOW_DATA_LINKS], SHOW_DATA_LINKS);

    act(() => {
      result.current.selectDisplayOptions(SHOW_ROUTER_LINKS);
    });
    expect(result.current.displayOptionsSelected).toEqual([SHOW_ROUTER_LINKS]);
    expect(onSelectedMock).toHaveBeenCalledWith([SHOW_ROUTER_LINKS], SHOW_ROUTER_LINKS);
  });
});
