import { Suspense } from 'react';

import { act, render, renderHook } from '@testing-library/react';

import { AvailableProtocols } from '../../../src/API/REST.enum';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import Metrics, { MetricsProps, useMetrics } from '../../../src/pages/shared/Metrics';
import { configDefaultFilters } from '../../../src/pages/shared/Metrics/Metrics.constants';

describe('useMetrics', () => {
  const initialProps = {
    defaultMetricFilterValues: { protocol: AvailableProtocols.Http },
    defaultOpenSections: { byterate: true },
    onGetMetricFiltersConfig: jest.fn(),
    onGetExpandedSectionsConfig: jest.fn()
  };

  it('initializes with the correct state from props', () => {
    const { result } = renderHook(() => useMetrics(initialProps));
    expect(result.current.queryParams).toEqual({ protocol: AvailableProtocols.Http });
    expect(result.current.shouldUpdateData).toBe(0);
  });

  it('updates shouldUpdateData correctly when triggerMetricUpdate is called', () => {
    const { result } = renderHook(() => useMetrics(initialProps));
    act(() => {
      result.current.triggerMetricUpdate();
    });
    expect(result.current.shouldUpdateData).not.toBe(0);
  });

  it('updates queryParams and calls onGetMetricFiltersConfig when handleFilterChange is invoked', () => {
    const { result } = renderHook(() => useMetrics(initialProps));
    const newFilters = { protocol: AvailableProtocols.Tcp };
    act(() => {
      result.current.handleFilterChange(newFilters);
    });
    expect(result.current.queryParams).toEqual(newFilters);
    expect(initialProps.onGetMetricFiltersConfig).toHaveBeenCalledWith(newFilters);
  });

  it('updates expanded sections and calls onGetExpandedSectionsConfig when handleSectionToggle is invoked', () => {
    const { result } = renderHook(() => useMetrics(initialProps));
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
    availableProtocols: [AvailableProtocols.Http, AvailableProtocols.Tcp, AvailableProtocols.Http2],
    onGetMetricFiltersConfig: jest.fn(),
    onGetExpandedSectionsConfig: jest.fn(),
    ...overrides
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Metrics {...setup()} />
        </Suspense>
      </Wrapper>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
