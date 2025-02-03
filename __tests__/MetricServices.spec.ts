import { describe, expect, it, vi } from 'vitest';

import * as PrometheusAPIModule from '../src/API/Prometheus.api';
import { alignDataSeriesWithZeros, normalizeResponsesFromSeries } from '../src/pages/shared/Metrics/metrics.utils';
import { MetricsController } from '../src/pages/shared/Metrics/services';
import { PrometheusMetric } from '../src/types/Prometheus.interfaces';
import { skAxisXY } from '../src/types/SkCharts';

describe('useMetrics', () => {
  it('should getLatencyPercentiles handles errors', async () => {
    const error = new Error('API request failed');

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchPercentilesByLeHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    await expect(
      MetricsController.getLatencyPercentiles({
        /* ... */
      })
    ).rejects.toThrow(error);
  });

  it('should getRequests handles errors', async () => {
    const error = new Error('API request failed');

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchRequestRateByMethodHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    await expect(
      MetricsController.getRequests({
        /* ... */
      })
    ).rejects.toThrow(error);
  });

  it('should getResponse handles errors', async () => {
    const error = new Error('API request failed');

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchResponseCountsByPartialCodeHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchHttpErrorRateByPartialCodeHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    await expect(
      MetricsController.getResponses({
        /* ... */
      })
    ).rejects.toThrow(error);
  });

  it('should getDataTraffic handles errors', async () => {
    const error = new Error('API request failed');

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchByteRateHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    await expect(
      MetricsController.getDataTraffic({
        /* ... */
      })
    ).rejects.toThrow(error);
  });

  it('should getConnections handles errors', async () => {
    const error = new Error('API request failed');

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchInstantOpenConnections').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchOpenConnectionsHistory').mockImplementation(
      vi.fn().mockRejectedValue(error)
    );

    await expect(
      MetricsController.getConnections({
        /* ... */
      })
    ).rejects.toThrow(error);
  });
});

describe('alignDataSeriesWithZeros', () => {
  it('should fill rxSeries with zeros if it is empty and txSeries is not', () => {
    const txSeries: skAxisXY[] = [
      { x: 1, y: 10 },
      { x: 2, y: 20 }
    ];
    const rxSeries: skAxisXY[] = [];

    const [filledRxSeries, filledTxSeries] = alignDataSeriesWithZeros(rxSeries, txSeries);

    expect(filledRxSeries).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ]);
    expect(filledTxSeries).toEqual(txSeries);
  });

  it('should fill txSeries with zeros if it is empty and rxSeries is not', () => {
    const rxSeries: skAxisXY[] = [
      { x: 1, y: 10 },
      { x: 2, y: 20 }
    ];
    const txSeries: skAxisXY[] = [];

    const [filledRxSeries, filledTxSeries] = alignDataSeriesWithZeros(rxSeries, txSeries);

    expect(filledRxSeries).toEqual(rxSeries);
    expect(filledTxSeries).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ]);
  });

  it('should return the original series if both are non-empty', () => {
    const rxSeries: skAxisXY[] = [
      { x: 1, y: 10 },
      { x: 2, y: 20 }
    ];
    const txSeries: skAxisXY[] = [
      { x: 1, y: 5 },
      { x: 2, y: 15 }
    ];

    const [filledRxSeries, filledTxSeries] = alignDataSeriesWithZeros(rxSeries, txSeries);

    expect(filledRxSeries).toEqual(rxSeries);
    expect(filledTxSeries).toEqual(txSeries);
  });

  it('should return empty series if both are empty', () => {
    const rxSeries: skAxisXY[] = [];
    const txSeries: skAxisXY[] = [];

    const [filledRxSeries, filledTxSeries] = alignDataSeriesWithZeros(rxSeries, txSeries);

    expect(filledRxSeries).toEqual([]);
    expect(filledTxSeries).toEqual([]);
  });
});

describe('normalizeResponsesFromSeries', () => {
  it('should return null if axisValues is null', () => {
    const data: PrometheusMetric<'matrix'>[] = [];

    const result = normalizeResponsesFromSeries(data);

    expect(result).toBeNull();
  });

  it('should return normalized response metrics', () => {
    const data: PrometheusMetric<'matrix'>[] = [
      {
        metric: { code: '2' },
        values: [
          [1, 10],
          [2, 20]
        ]
      },
      {
        metric: { code: '3' },
        values: [
          [1, 10],
          [2, 20]
        ]
      },
      {
        metric: { code: '4' },
        values: [
          [1, 10],
          [2, 20]
        ]
      },
      {
        metric: { code: '5' },
        values: [
          [1, 10],
          [2, 20]
        ]
      }
    ];

    const result = normalizeResponsesFromSeries(data);

    expect(result).toEqual({
      statusCode2xx: {
        total: 20,
        label: '2',
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 }
        ]
      },
      statusCode3xx: {
        total: 20,
        label: '3',
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 }
        ]
      },
      statusCode4xx: {
        total: 20,
        label: '4',
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 }
        ]
      },
      statusCode5xx: {
        total: 20,
        label: '5',
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 20 }
        ]
      },
      total: 80
    });
  });
});
