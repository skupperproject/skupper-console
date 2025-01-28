import { PrometheusApi } from '../../../../API/Prometheus.api';
import { getHistoryValuesFromPrometheusData } from '../../../../API/Prometheus.utils';
import { Quantiles } from '../../../../API/REST.enum';
import { defaultTimeInterval } from '../../../../config/prometheus';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '../../../../core/utils/getCurrentAndPastTimestamps';
import {
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics,
  ConnectionMetrics,
  QueryMetricsParams,
  getDataTrafficMetrics
} from '../../../../types/Metrics.interfaces';
import { PrometheusQueryParams } from '../../../../types/Prometheus.interfaces';
import { skAxisXY } from '../../../../types/SkChartArea.interfaces';
import {
  alignDataSeriesWithZeros,
  normalizeByteRateFromSeries,
  normalizeLatencies,
  normalizeRequestFromSeries,
  normalizeResponsesFromSeries,
  sumValuesByTimestamp
} from '../metrics.utils';

export const MetricsController = {
  getLatencyPercentiles: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    direction,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<LatencyMetrics[] | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      direction,
      start,
      end
    };

    try {
      const [quantile50latency, quantile90latency, quantile95latency, quantile99latency] = await Promise.all([
        PrometheusApi.fetchPercentilesByLeHistory({ ...params, quantile: Quantiles.Median }),
        PrometheusApi.fetchPercentilesByLeHistory({ ...params, quantile: Quantiles.Ninety }),
        PrometheusApi.fetchPercentilesByLeHistory({ ...params, quantile: Quantiles.NinetyFive }),
        PrometheusApi.fetchPercentilesByLeHistory({ ...params, quantile: Quantiles.NinetyNine })
      ]);

      const latenciesData = normalizeLatencies({
        quantile50latency,
        quantile90latency,
        quantile95latency,
        quantile99latency
      });

      return latenciesData;
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getRequests: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<{
    requestRateData: RequestMetrics[] | null;
    requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
  }> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      protocol,
      start,
      end
    };
    try {
      const requestsByProcess = await PrometheusApi.fetchRequestRateByMethodHistory(params);
      const requestRateData = normalizeRequestFromSeries(requestsByProcess);
      const requestPerf = requestRateData?.map(({ data, label }) => ({
        label,
        max: formatToDecimalPlacesIfCents(data.reduce((acc, { y }) => (y > acc ? y : acc), 0)),
        avg: formatToDecimalPlacesIfCents(data.reduce((acc, { y }) => acc + y, 0) / data.length),
        current: formatToDecimalPlacesIfCents(data[data.length - 1].y)
      }));

      return {
        requestPerf,
        requestRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getResponses: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<{
    responseData: ResponseMetrics | null;
    responseRateData: ResponseMetrics | null;
  }> => {
    try {
      const params: PrometheusQueryParams = {
        sourceSite,
        destSite,
        sourceComponent,
        destComponent,
        // who send a request (sourceProcess) should query the response as a destProcess
        sourceProcess,
        destProcess,
        service,
        protocol,
        start,
        end
      };

      const [responsesByProcess, errorRateByProcess] = await Promise.all([
        PrometheusApi.fetchResponseCountsByPartialCodeHistory(params),
        PrometheusApi.fetchHttpErrorRateByPartialCodeHistory(params)
      ]);

      const responseData = normalizeResponsesFromSeries(responsesByProcess);
      const responseRateData = normalizeResponsesFromSeries(errorRateByProcess);

      return {
        responseData,
        responseRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getDataTraffic: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<getDataTrafficMetrics> => {
    const params: PrometheusQueryParams = {
      service,
      start,
      end,
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess
    };

    const invertedParams = {
      ...params,
      sourceSite: destSite, //client
      destSite: sourceSite, //server
      sourceComponent: destComponent,
      destComponent: sourceComponent,
      sourceProcess: destProcess,
      destProcess: sourceProcess
    };

    const areAllServicesSelected = !!service && !sourceSite && !destSite && !sourceProcess && !destProcess;
    const isSameSite = !!sourceSite && !!destSite && sourceSite === destSite;

    try {
      const [sourceToDestByteRateTx, destToSourceByteRateRx, destToSourceByteRateTx, sourceToDestByteRateRx] =
        await Promise.all([
          // Outgoing byte rate: Data sent from the source to the destination
          areAllServicesSelected || (!service && isSameSite) ? [] : PrometheusApi.fetchByteRateHistory(params),
          // Incoming byte rate: Data received at the destination from the source
          areAllServicesSelected || (!service && isSameSite) ? [] : PrometheusApi.fetchByteRateHistory(params, true),
          // Outgoing byte rate from the other side: Data sent from the destination to the source
          !areAllServicesSelected && service ? [] : PrometheusApi.fetchByteRateHistory(invertedParams),
          // Incoming byte rate from the other side: Data received at the source from the destination
          !areAllServicesSelected && service ? [] : PrometheusApi.fetchByteRateHistory(invertedParams, true)
        ]);

      return {
        traffic: normalizeByteRateFromSeries(
          sumValuesByTimestamp([...sourceToDestByteRateTx, ...sourceToDestByteRateRx]),
          sumValuesByTimestamp([...destToSourceByteRateTx, ...destToSourceByteRateRx])
        ),
        trafficClient: normalizeByteRateFromSeries(
          sumValuesByTimestamp(sourceToDestByteRateTx),
          sumValuesByTimestamp(destToSourceByteRateRx)
        ),
        trafficServer: normalizeByteRateFromSeries(
          sumValuesByTimestamp(sourceToDestByteRateRx),
          sumValuesByTimestamp(destToSourceByteRateTx)
        )
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getConnections: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<ConnectionMetrics | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      start,
      end
    };

    const invertedParams = {
      ...params,
      sourceSite: destSite, //client
      destSite: sourceSite, //server
      sourceComponent: destComponent,
      destComponent: sourceComponent,
      sourceProcess: destProcess,
      destProcess: sourceProcess
    };

    try {
      const [liveConnectionsIn, liveConnectionsInTimeRangeData, liveConnectionOut, liveConnectionsOutTimeRangeData] =
        await Promise.all([
          PrometheusApi.fetchInstantOpenConnections(params),
          PrometheusApi.fetchOpenConnectionsHistory(params),
          service ? [] : PrometheusApi.fetchInstantOpenConnections(invertedParams),
          service ? [] : PrometheusApi.fetchOpenConnectionsHistory(invertedParams)
        ]);

      if (
        !liveConnectionsIn.length &&
        !liveConnectionOut.length &&
        !liveConnectionsInTimeRangeData.length &&
        !liveConnectionsOutTimeRangeData.length
      ) {
        return null;
      }

      const liveConnectionsCount =
        (Number(liveConnectionsIn[0]?.value[1]) || 0) + (Number(liveConnectionOut[0]?.value[1]) || 0);

      const liveConnectionsSerie = getHistoryValuesFromPrometheusData(
        sumValuesByTimestamp([...liveConnectionsInTimeRangeData, ...liveConnectionsOutTimeRangeData])
      );

      return {
        liveConnectionsCount,
        liveConnectionsSerie
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },
  /**
   * Ensure that both the "Tx" and "Rx" data series have the same number of data points, even if one of the series has fewer data points than the other
   * If one of the two series is empty, it is filled with values where y=0 and x equals the timestamp of the other series.
   */
  fillMissingDataWithZeros(rxSeries: skAxisXY[] = [], txSeries: skAxisXY[] = []) {
    return alignDataSeriesWithZeros(rxSeries, txSeries);
  }
};
