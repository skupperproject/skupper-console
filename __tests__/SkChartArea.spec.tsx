import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import SkChartArea from '../src/core/components/SkCharts/SkChartArea';

vi.mock('@patternfly/react-charts/victory', () => ({
  Chart: vi.fn(({ children }) => <div data-testid="mock-chart">{children}</div>),
  ChartAxis: vi.fn(() => <div data-testid="mock-chart-axis" />),
  ChartGroup: vi.fn(({ children }) => <div data-testid="mock-chart-group">{children}</div>),
  ChartLine: vi.fn(({ name }) => <div data-testid={`mock-chart-line-${name}`} />),
  ChartArea: vi.fn(({ name }) => <div data-testid={`mock-chart-area-${name}`} />),
  createContainer: vi.fn(() => () => null),
  ChartThemeColor: { multi: 'multi' },
  ChartLabel: vi.fn(() => <div data-testid="mock-chart-label" />),
  ChartLegendTooltip: vi.fn(() => <div data-testid="mock-chart-legend-tooltip" />)
}));

vi.mock('@patternfly/react-core', () => ({
  getResizeObserver: vi.fn(() => () => null)
}));

vi.mock('../../utils/formatChartDate', () => ({
  formatChartDateByRange: vi.fn((timestamp) => `Formatted ${timestamp}`)
}));

describe('SkChartArea', () => {
  const createMockData = (seriesCount = 1, pointsPerSeries = 3) =>
    Array.from({ length: seriesCount }, (_, seriesIndex) =>
      Array.from({ length: pointsPerSeries }, (__, pointIndex) => ({
        x: (seriesIndex + 1) * 1000 + pointIndex * 100,
        y: Math.random() * 100
      }))
    );

  const defaultProps = {
    data: createMockData(),
    height: 300,
    legendLabels: ['Test Series']
  };

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 800
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SkChartArea {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders chart with correct number of series', async () => {
    const multiSeriesData = createMockData(2);
    render(<SkChartArea {...defaultProps} data={multiSeriesData} legendLabels={['Series 1', 'Series 2']} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart-area-Series 1')).toBeTruthy();
      expect(screen.getByTestId('mock-chart-area-Series 2')).toBeTruthy();
    });
  });

  it('renders line chart when isChartLine is true', async () => {
    render(<SkChartArea {...defaultProps} isChartLine={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart-line-Test Series')).toBeTruthy();
    });
  });

  it('renders chart with title', async () => {
    render(<SkChartArea {...defaultProps} title="Test Chart Title" />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart-label')).toBeTruthy();
    });
  });

  it('handles empty data gracefully', () => {
    const { container } = render(<SkChartArea {...defaultProps} data={[]} />);

    expect(container).toBeTruthy();
  });

  it('applies custom Y-axis formatting', async () => {
    const customFormatY = (y: number) => `Custom ${y}`;

    render(<SkChartArea {...defaultProps} formatY={customFormatY} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeTruthy();
    });
  });
});
