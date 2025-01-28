import { vi, beforeEach, describe, expect, it } from 'vitest';

import { fetchApiData } from '../src/API//ApiClient';
import {
  executeQuery,
  gePrometheusQueryPATH,
  getPrometheusResolutionInSeconds,
  getHistoryFromPrometheusData,
  getHistoryLabelsFromPrometheusData,
  fillMatrixTimeseriesGaps,
  getHistoryValuesFromPrometheusData
} from '../src/API/Prometheus.utils';
import { PROMETHEUS_URL_RANGE_QUERY, PROMETHEUS_URL_SINGLE_QUERY } from '../src/config/api';
import { PrometheusLabelsV2 } from '../src/config/prometheus';
import { PrometheusMetric } from '../src/types/Prometheus.interfaces';

// Mock the API client
const mockFetchApiData = vi.hoisted(() => vi.fn());

vi.mock(import('../src/API//ApiClient'), () => ({
  fetchApiData: mockFetchApiData
}));

describe('Prometheus Utility Functions', () => {
  describe('gePrometheusQueryPATH', () => {
    it('should return range query URL when type is range', () => {
      expect(gePrometheusQueryPATH('range')).toBe(PROMETHEUS_URL_RANGE_QUERY);
    });

    it('should return single query URL when type is single', () => {
      expect(gePrometheusQueryPATH('single')).toBe(PROMETHEUS_URL_SINGLE_QUERY);
    });

    it('should return range query URL by default', () => {
      expect(gePrometheusQueryPATH()).toBe(PROMETHEUS_URL_RANGE_QUERY);
    });
  });

  describe('getPrometheusResolutionInSeconds', () => {
    it('should return 15min loopback for 24h+ range', () => {
      const result = getPrometheusResolutionInSeconds(60 * 60 * 25); // 25 hours
      expect(result.loopback).toBe('900s'); // 15 minutes
      expect(result.step).toBeDefined();
    });

    it('should return 5min loopback for 12h+ range', () => {
      const result = getPrometheusResolutionInSeconds(60 * 60 * 13); // 13 hours
      expect(result.loopback).toBe('300s'); // 5 minutes
      expect(result.step).toBeDefined();
    });

    it('should return 3min loopback for 6h+ range', () => {
      const result = getPrometheusResolutionInSeconds(60 * 60 * 7); // 7 hours
      expect(result.loopback).toBe('180s'); // 3 minutes
      expect(result.step).toBeDefined();
    });

    it('should return 1min loopback for shorter ranges', () => {
      const result = getPrometheusResolutionInSeconds(60 * 60 * 5); // 5 hours
      expect(result.loopback).toBe('60s'); // 1 minute
      expect(result.step).toBeDefined();
    });
  });

  describe('getHistoryValuesFromPrometheusData', () => {
    const mockData: PrometheusMetric<'matrix'>[] | [] = [
      {
        metric: { label: 'test' },
        values: [
          [1000, 10.5],
          [2000, 20.5],
          [3000, NaN]
        ]
      }
    ];

    it('should return null for empty data', () => {
      expect(getHistoryValuesFromPrometheusData([])).toBeNull();
    });

    it('should convert values to proper format', () => {
      const result = getHistoryValuesFromPrometheusData(mockData);
      expect(result).toEqual([
        [
          { x: 1000, y: 10.5 },
          { x: 2000, y: 20.5 },
          { x: 3000, y: 0 } // NaN converted to 0
        ]
      ]);
    });
  });

  describe('getHistoryLabelsFromPrometheusData', () => {
    const mockData: PrometheusMetric<'matrix'>[] | [] = [
      {
        metric: { label1: 'test1', label2: 'test2' },
        values: [[1000, 10.5]]
      }
    ];

    it('should return null for empty data', () => {
      expect(getHistoryLabelsFromPrometheusData([])).toBeNull();
    });

    it('should extract labels correctly', () => {
      const result = getHistoryLabelsFromPrometheusData(mockData);
      expect(result).toEqual(['test1', 'test2']);
    });
  });

  describe('getHistoryFromPrometheusData', () => {
    const mockData: PrometheusMetric<'matrix'>[] | [] = [
      {
        metric: { label: 'test' },
        values: [[1000, 10.5]]
      }
    ];

    it('should return null for empty data', () => {
      expect(getHistoryFromPrometheusData([])).toBeNull();
    });

    it('should return combined values and labels', () => {
      const result = getHistoryFromPrometheusData(mockData);
      expect(result).toHaveProperty('values');
      expect(result).toHaveProperty('labels');
      expect(result?.values[0][0]).toEqual({ x: 1000, y: 10.5 });
      expect(result?.labels).toEqual(['test']);
    });
  });

  describe('executeQuery', () => {
    const mockQueryFn = vi.fn((filter) => `rate(some_metric{${filter}}[5m])`);
    const mockParams = {
      [PrometheusLabelsV2.SourceProcessName]: 'site1',
      start: 1000,
      end: 2000
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute matrix query correctly', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              metric: { label: 'test' },
              values: [
                [1000, '10'],
                [2000, '20']
              ]
            }
          ]
        }
      };

      mockFetchApiData.mockResolvedValueOnce(mockResponse);

      const result = await executeQuery(mockQueryFn, mockParams, 'matrix');

      expect(fetchApiData).toHaveBeenCalledWith(
        PROMETHEUS_URL_RANGE_QUERY,
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.any(String),
            start: 1000,
            end: 2000,
            step: expect.any(String)
          })
        })
      );

      expect(result).toEqual(mockResponse.data.result);
    });

    it('should execute vector query correctly', async () => {
      const mockResponse = {
        data: {
          result: [{ metric: { label: 'test' }, value: [1000, '10'] }]
        }
      };

      mockFetchApiData.mockResolvedValueOnce(mockResponse);

      const result = await executeQuery(mockQueryFn, mockParams, 'vector');

      expect(fetchApiData).toHaveBeenCalledWith(
        PROMETHEUS_URL_SINGLE_QUERY,
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.any(String)
          })
        })
      );

      expect(result).toEqual(mockResponse.data.result);
    });

    it('should handle query errors', async () => {
      mockFetchApiData.mockRejectedValueOnce(new Error('Network Error'));

      await expect(executeQuery(mockQueryFn, mockParams, 'matrix')).rejects.toThrow('Network Error');
    });
  });

  describe('fillMatrixTimeseriesGaps', () => {
    it('should fill missing values with zeros at regular intervals', () => {
      const startTime = 1000;
      const endTime = 1300;
      const mockResult: PrometheusMetric<'matrix'>[] | [] = [
        {
          metric: { label: 'test' },
          values: [
            [1000, 10], // Initial point
            [1100, 20], // +100ms
            [1300, 40] // +200ms
          ]
        }
      ];

      const filledResult = fillMatrixTimeseriesGaps(mockResult, startTime, endTime);

      // With interval of 100 (from first two points), we should get:
      // 1000: original value (10)
      // 1100: original value (20)
      // 1200: filled with 0 (no original value at this time)
      // 1300: original value (40)
      expect(filledResult[0].values).toEqual([
        [1000, 10],
        [1100, 20],
        [1200, 0], // Gap filled with 0
        [1300, 40]
      ]);
    });

    it('should fill multiple consecutive gaps with zeros', () => {
      const startTime = 1000;
      const endTime = 1400;
      const mockResult: PrometheusMetric<'matrix'>[] | [] = [
        {
          metric: { label: 'test' },
          values: [
            [1000, 10], // Initial point
            [1100, 20], // +100ms
            [1400, 50] // +300ms - creates 2 gaps
          ]
        }
      ];

      const filledResult = fillMatrixTimeseriesGaps(mockResult, startTime, endTime);

      // With interval of 100, we should get values at: 1000, 1100, 1200, 1300, 1400
      expect(filledResult[0].values).toEqual([
        [1000, 10],
        [1100, 20],
        [1200, 0], // First gap filled
        [1300, 0], // Second gap filled
        [1400, 50]
      ]);
    });

    it('should maintain existing values in time series data', () => {
      const startTime = 1000;
      const endTime = 3000;
      const mockResult: PrometheusMetric<'matrix'>[] | [] = [
        {
          metric: { label: 'test' },
          values: [
            [1000, 10],
            [2000, 20],
            [3000, 30]
          ]
        }
      ];

      const filledResult = fillMatrixTimeseriesGaps(mockResult, startTime, endTime);
      expect(filledResult[0].values).toEqual([
        [1000, 10],
        [2000, 20],
        [3000, 30]
      ]);
    });

    it('should handle single value', () => {
      const mockResult: PrometheusMetric<'matrix'>[] | [] = [
        {
          metric: { label: 'test' },
          values: [[1000, 10]]
        }
      ];

      const result = fillMatrixTimeseriesGaps(mockResult, 1000, 1000);
      expect(result[0].values).toEqual([[1000, 10]]);
    });

    it('should handle empty result', () => {
      const result = fillMatrixTimeseriesGaps([], 1000, 2000);
      expect(result).toEqual([]);
    });
  });
});
