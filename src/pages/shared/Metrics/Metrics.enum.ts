export enum MetricsLabels {
  TrafficSent = 'transmitted',
  TrafficReceived = 'received',
  ClientErrorRateSeriesAxisYLabel = 'Client Error rate',
  ServerErrorRateSeriesAxisYLabel = 'Server Error rate',
  FilterAllSourceProcesses = 'All processes',
  FilterAllDestinationProcesses = 'All clients and servers',
  FilterProtocolsDefault = 'All Protocols',
  NoMetricFoundTitleMessage = 'No metrics found',
  NoMetricFoundDescriptionMessage = 'No metrics are currently accessible or meet the filter criteria. Please modify all filters and the time window, then attempt the operation again.',
  LatencyMetricAvg = 'Avg latency',
  LatencyMetric50quantile = '50th percentile',
  LatencyMetric90quantile = '90th percentile',
  LatencyMetric99quantile = '99th percentile',
  RequestTotalTitle = 'Total Requests',
  RequestRateAvgTitle = 'Avg. Request rate',
  ByteRateAvgCol = 'avg',
  ByteRateTotalCol = 'total',
  ByteRateCurrentCol = 'current',
  ByteRateMaxCol = 'max',
  RefetchData = 'Data update',
  LatencyTitle = 'Http Latency',
  RequestsTitle = 'Http Requests',
  HttpStatus = 'Http Response Status'
}
