import { IntervalTimePropValue } from './Prometheus.interfaces';
import { AvailableProtocols, Quantiles } from './REST.enum';

export const queries = {
  // http request queries
  getRequestRateByMethodInInTimeRange(param: string, range: IntervalTimePropValue) {
    return `sum by(method)(rate(http_requests_method_total{${param}}[${range}]))`;
  },

  // http response queries
  getResponseCountsByPartialCodeInTimeRange(param: string, range: IntervalTimePropValue) {
    return `sum by(partial_code)(label_replace(sum_over_time(http_requests_result_total{${param}}[${range}]),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  getResponseRateByPartialCodeInTimeRange(param: string, range: IntervalTimePropValue) {
    return `sum by(partial_code)(label_replace(rate((http_requests_result_total{${param}}[${range}])),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  // latency queries
  getPercentilesByLeInTimeRange(param: string, range: IntervalTimePropValue, quantile: Quantiles) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },

  getBucketCountsInTimeRange(param: string, range: IntervalTimePropValue) {
    return `sum by(le)(floor(delta(flow_latency_microseconds_bucket{${param}}[${range}])))`;
  },

  // data transfer queries
  getByteRateByDirectionInTimeRange(paramSource: string, range: IntervalTimePropValue) {
    return `sum by(direction)(rate(octets_total{${paramSource}}[${range}]))`;
  },

  getAllProcessPairsBytes() {
    return `sum by(destProcess, sourceProcess,direction)(octets_total)`;
  },

  getAllProcessPairsByteRates() {
    return `sum by(destProcess, sourceProcess,direction)(rate(octets_total[1m]))`;
  },

  getAllProcessPairsLatencies() {
    return `sum by(sourceProcess, destProcess)(rate(flow_latency_microseconds_sum[1m]))`;
  },

  getTotalHttpFlowByService() {
    return `sum by(address)(flows_total{protocol=~"${AvailableProtocols.AllHttp}"}/2)`;
  },

  getTotalTcpFlowByService() {
    return `sum by(address)(flows_total{protocol=~"${AvailableProtocols.Tcp}"})`;
  },

  getActiveFlows(paramSource: string) {
    return `sum(active_flows{${paramSource}})`;
  },

  getActiveFlowsRateInTimeRange(paramSource: string, range: IntervalTimePropValue) {
    return `sum(rate(active_flows{${paramSource}}[${range}]))`;
  },

  getTotalFlows(paramSource: string) {
    return `sum(flows_total{${paramSource}})`;
  },

  getTcpActiveFlowsByService() {
    return `sum by(address)(active_flows{protocol="${AvailableProtocols.Tcp}"})`;
  },

  getTcpByteRateByService(serviceName: string) {
    return `rate(octets_total{protocol="tcp",  address="${serviceName}"}[1m])`;
  },

  getResourcePairsByService(param: string, groupBy: string, time: string) {
    return `sum by(${groupBy})(rate(octets_total{${param}}[${time}]) > 0)`;
  }
};
