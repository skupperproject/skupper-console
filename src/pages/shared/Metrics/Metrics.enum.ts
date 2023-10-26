export enum MetricsLabels {
  TrafficSent = 'Tx',
  TrafficReceived = 'Rx',
  ClientErrorRDistributionSeriesAxisYLabel = 'Error distribution',
  ErrorLabel = 'errors',
  ErrorRateSeriesAxisYLabel = 'error rate',
  FilterAllSourceSites = 'All source sites',
  FilterAllDestinationSites = 'All connected sites',
  FilterAllSourceProcesses = 'All source processes',
  FilterAllDestinationProcesses = 'All connected processes',
  FilterProtocolsDefault = 'All protocols',
  NoMetricFoundTitleMessage = 'No metrics found',
  NoMetricFoundDescriptionMessage = 'No metrics are currently accessible or meet the filter criteria. Please modify all filters, then attempt the operation again.',
  LatencyMetricAvg = 'Avg latency',
  LatencyPercentileTitle = 'Percentile over time',
  LatencyBucketsTitle = 'Distribution across buckets',
  LatencyMetric50quantile = '50th percentile',
  LatencyMetric90quantile = '90th percentile',
  LatencyMetric95quantile = '95th percentile',
  LatencyMetric99quantile = '99th percentile',
  MaxRequestRate = 'Max rps',
  RequestRateAvgTitle = 'Avg. rps',
  RequestRateCurrentTitle = 'Current rps',
  ByteRateAvgCol = 'avg',
  ByteRateTotalCol = 'total',
  ByteRateCurrentCol = 'current',
  ByteRateMaxCol = 'max',
  RefetchData = 'Refresh',
  DataTransferTitle = 'Traffic',
  ByteRateTitle = 'Byte rate',
  LatencyTitle = 'Http latencies',
  ConnectionTitle = 'Tcp connections',
  TerminatedConnections = 'Closed connections',
  LiveConnections = 'Live connections',
  LiveConnectionsChartLabel = 'Connections',
  RequestsTitle = 'Http requests',
  RequestRateTitle = 'Request rate',
  ResposeTitle = 'Http responses',
  Method = 'Method'
}
