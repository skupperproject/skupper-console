import { axiosFetch } from './axiosMiddleware';
import {
    gePrometheusQueryPATH,
    queries,
    rangeStepIntervalMap,
    startDateOffsetMap,
} from './Prometheus.constant';
import {
    PrometheusApiResult,
    PrometheusQueryParams,
    ValidWindowTime,
} from './Prometheus.interfaces';

export const PrometheusApi = {
    fetchTotalRequestByProcess: async ({
        id,
        range,
        processIdDest,
        isRate = false,
    }: PrometheusQueryParams): Promise<PrometheusApiResult> => {
        const { start, end } = getRangeTimestamp(range);
        let param = `sourceProcess="${id}"`;

        if (processIdDest) {
            param = [param, `destProcess="${processIdDest}"`].join(',');
        }

        const {
            data: {
                data: { result },
            },
        } = await axiosFetch(gePrometheusQueryPATH(), {
            params: {
                query: isRate
                    ? queries.getTotalRequestPerSecondByProcess(param, range)
                    : queries.getTotalRequestsByProcess(param),
                start,
                end,
                step: rangeStepIntervalMap[range],
            },
        });

        return result.length ? result[0].values : [];
    },

    fetchLatencyByProcess: async ({
        id,
        range,
        processIdDest,
        quantile,
    }: PrometheusQueryParams): Promise<PrometheusApiResult> => {
        const { start, end } = getRangeTimestamp(range);
        let param = `sourceProcess="${id}"`;

        if (processIdDest) {
            param = [param, `destProcess="${processIdDest}"`].join(',');
        }

        const {
            data: {
                data: { result },
            },
        } = await axiosFetch(gePrometheusQueryPATH(), {
            params: {
                query: quantile
                    ? queries.getLatencyByProcess(param, range, quantile)
                    : queries.getAvgLatencyByProcess(param, range),
                start,
                end,
                step: rangeStepIntervalMap[range],
            },
        });

        return result.length ? result[0].values : [];
    },

    fetchStatusCodesByProcess: async ({
        id,
        range,
        processIdDest,
        isRate = false,
    }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
        const { start, end } = getRangeTimestamp(range);
        let param = `destProcess="${id}"`;

        if (processIdDest) {
            param = [param, `sourceProcess="${processIdDest}"`].join(',');
        }

        const {
            data: {
                data: { result },
            },
        } = await axiosFetch(gePrometheusQueryPATH(), {
            params: {
                query: isRate
                    ? queries.getResponseStatusCodesPerSecondByProcess(param, range)
                    : queries.getResponseStatusCodesByProcess(param),
                start,
                end,
                step: rangeStepIntervalMap[range],
            },
        });

        // it retrieves X arrays of [values, timestamps], 2XX, 3XX, 4XX, 5XX
        return result;
    },

    fetchDataTraffic: async ({
        id,
        range,
        processIdDest,
        isRate = false,
    }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
        const { start, end } = getRangeTimestamp(range);
        let param1 = `direction="incoming", sourceProcess="${id}"`;
        let param2 = `direction="outgoing",destProcess="${id}"`;

        if (processIdDest) {
            param1 = [param1, `destProcess="${processIdDest}"`].join(',');
            param2 = [param2, `sourceProcess="${processIdDest}"`].join(',');
        }

        const {
            data: {
                data: { result },
            },
        } = await axiosFetch(gePrometheusQueryPATH(), {
            params: {
                query: isRate
                    ? queries.getDataTrafficPerSecondByProcess(param1, param2, range)
                    : queries.getDataTraffic(param1, param2),
                start,
                end,
                step: rangeStepIntervalMap[range],
            },
        });

        // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
        return result;
    },
};

function getRangeTimestamp(range: keyof ValidWindowTime): { start: number; end: number } {
    return {
        start: new Date().getTime() / 1000 - startDateOffsetMap[range] || 0,
        end: new Date().getTime() / 1000,
    };
}
