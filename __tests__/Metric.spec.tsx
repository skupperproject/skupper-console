import { Suspense } from 'react';

import { act, render, renderHook } from '@testing-library/react';

import { Protocols } from '../src/API/REST.enum';
import LoadingPage from '../src/core/components/SkLoading';
import Metrics, { MetricsProps } from '../src/pages/shared/Metrics';
import { useMetricsState } from '../src/pages/shared/Metrics/hooks/useMetricsState';
import { configDefaultFilters } from '../src/pages/shared/Metrics/Metrics.constants';
import { Providers } from '../src/providers';

describe('useMetrics', () => {
  const initialProps = {
    sessionKey: 'test-id',
    defaultMetricFilterValues: { protocol: Protocols.Http }
  };

  it('initializes with the correct state from props', () => {
    const { result } = renderHook(() => useMetricsState(initialProps));
    expect(result.current.selectedFilters).toEqual({ protocol: Protocols.Http });
    expect(result.current.shouldUpdateData).toBe(0);
  });

  it('updates shouldUpdateData correctly when triggerMetricUpdate is called', () => {
    const { result } = renderHook(() => useMetricsState(initialProps));
    act(() => {
      result.current.triggerMetricUpdate();
    });
    expect(result.current.shouldUpdateData).not.toBe(0);
  });

  it('updates queryParams and calls onGetMetricFiltersConfig when handleFilterChange is invoked', () => {
    const { result } = renderHook(() => useMetricsState(initialProps));
    const newFilters = { protocol: Protocols.Tcp };
    act(() => {
      result.current.handleFilterChange(newFilters);
    });

    expect(result.current.selectedFilters).toEqual(newFilters);
  });
});

describe('Metrics Component', () => {
  const setup = (overrides?: Partial<MetricsProps>) => ({
    configFilters: configDefaultFilters,
    defaultMetricFilterValues: {},
    defaultOpenSections: {},
    sourceSites: [],
    destSites: [],
    sourceProcesses: [],
    destProcesses: [],
    availableProtocols: [Protocols.Http, Protocols.Tcp, Protocols.Http2],
    onGetMetricFiltersConfig: jest.fn(),
    onGetExpandedSectionsConfig: jest.fn(),
    ...overrides
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Metrics {...setup()} />
        </Suspense>
      </Providers>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
