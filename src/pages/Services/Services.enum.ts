export enum ServicesRoutesPaths {
  Services = '/services'
}

export enum QueriesServices {
  GetBiFlow = 'services-biFlow-query',
  GetProcessesByService = 'processes-by-service-query',
  GetTcpByteRateByService = 'tcp-byterate-by-service-query',
  GetServices = 'services-query',
  GetService = 'service-query',
  GetListeners = 'listeners-query',
  GetConnectors = 'connectors-query',
  GetPrometheusActiveFlows = 'services-get-prometheus-active-flows',
  GetPrometheusTcpTotalFlows = 'services-get-tcp-prometheus-total-flows',
  GetPrometheusHttpTotalFlows = 'services-get-http-prometheus-total-flows',
  GetPrometheusPairsByService = 'services-get-prometheus-pair-by-service',
  GetProcessPairsByService = 'services-get-process-pairs-by-service'
}
