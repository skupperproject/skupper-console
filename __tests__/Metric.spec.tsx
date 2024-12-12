import { Suspense } from 'react';

import { act, render, renderHook } from '@testing-library/react';

import { Protocols } from '../src/API/REST.enum';
import LoadingPage from '../src/core/components/SkLoading';
import { Providers } from '../src/providers';
import Metrics, { MetricsProps } from '../src/pages/shared/Metrics';
import { useMetricsState } from '../src/pages/shared/Metrics/hooks/useMetricsState';
import { configDefaultFilters } from '../src/pages/shared/Metrics/Metrics.constants';

describe('useMetrics', () => {
  const initialProps = {
    defaultMetricFilterValues: { protocol: Protocols.Http },
    defaultOpenSections: { byterate: true },
    onGetMetricFiltersConfig: jest.fn(),
    onGetExpandedSectionsConfig: jest.fn()
  };

  it('initializes with the correct state from props', () => {
    const { result } = renderHook(() => useMetricsState(initialProps));
    expect(result.current.queryParams).toEqual({ protocol: Protocols.Http });
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
    expect(result.current.queryParams).toEqual(newFilters);
    expect(initialProps.onGetMetricFiltersConfig).toHaveBeenCalledWith(newFilters);
  });

  it('updates expanded sections and calls onGetExpandedSectionsConfig when handleSectionToggle is invoked', () => {
    const { result } = renderHook(() => useMetricsState(initialProps));
    const newSections = { traffic: false };
    act(() => {
      result.current.handleSectionToggle(newSections);
    });
    expect(initialProps.onGetExpandedSectionsConfig).toHaveBeenCalledWith({
      ...initialProps.defaultOpenSections,
      ...newSections
    });
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
