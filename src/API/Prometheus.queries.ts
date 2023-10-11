import { IntervalTimePropValue } from './Prometheus.interfaces';
import { AvailableProtocols } from './REST.enum';

export const queries = {
  // http request queries
  getTotalRequestsTimeInterval(param: string, range: IntervalTimePropValue) {
    return `max(sum(rate(http_requests_method_total{${param}}[${range}])))`;
  },

  getAvgRequestRateTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum(rate(http_requests_method_total{${param}}[${range}]))`;
  },

  getTotalRequestRateByMethodTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum by(method)(rate(http_requests_method_total{${param}}[${range}]))`;
  },

  // http response queries
  getHttpPartialStatus(param: string, range: IntervalTimePropValue) {
    return `sum by(partial_code)(label_replace(sum_over_time(http_requests_result_total{${param}}[${range}]),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  getHttpPartialStatusRateTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum by(partial_code)(label_replace(rate((http_requests_result_total{${param}}[${range}])),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  // latency queries
  getQuantileTimeInterval(param: string, range: IntervalTimePropValue, quantile: 0.5 | 0.9 | 0.99) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },

  getAvgLatencyTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum(rate(flow_latency_microseconds_sum{${param}}[${range}]))/sum(rate(flow_latency_microseconds_count{${param}}[${range}]))`;
  },

  // data transfer queries
  getBytesByDirection(param: string, range: IntervalTimePropValue) {
    return `sum by(direction)(increase(octets_total{${param}}[${range}]))`;
  },

  getByteRateByDirectionTimeInterval(paramSource: string, range: IntervalTimePropValue) {
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

  getActiveFlowsByService() {
    return `sum by(address)(increase(active_flows{protocol=~"${AvailableProtocols.AllHttp}"}[30s]) or active_flows{protocol="${AvailableProtocols.Tcp}"})`;
  },

  getTcpByteRateByService(serviceName: string) {
    return `rate(octets_total{protocol="tcp",  address="${serviceName}"}[1m])`;
  },

  getResourcePairsByService(param: string, groupBy: string, time: string) {
    return `sum by(${groupBy})(rate(octets_total{${param}}[${time}]) > 0)`;
  }
};
