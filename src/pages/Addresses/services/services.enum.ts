export enum QueriesServices {
  GetFlowPair = 'services-flowpair-query',
  GetFlowPairsByService = 'services-flowpairs-by-service-query',
  GetProcessesByService = 'processes-by-service-query',
  GetTcpByteRateByService = 'tcp-byterate-by-service-query',
  GetServices = 'services-query',
  GetPrometheusActiveFlows = 'services-get-prometheus-active-flows',
  GetPrometheusTcpTotalFlows = 'services-get-tcp-prometheus-total-flows',
  GetPrometheusHttpTotalFlows = 'services-get-http-prometheus-total-flows',
  GetResourcePairsByService = 'services-get-resource-pair-by-service'
}
