export enum QueriesTopology {
  GetProcessGroups = 'get-topology-process-groups-query',
  GetRemoteProcessGroups = 'get-topology-remote-process-groups-query',
  GetProcesses = 'get-topology-processes-query',
  GetProcessesPairs = 'get-topology-processes-pairs-query',
  GetFlowPairsByAddressResult = 'get-topology-flow-pairs-by-service-result-query',
  GetBytesByProcessPairs = 'get-bytes-process-pairs-result-query',
  GetByteRateByProcessPairs = 'get-byte-rate-process-pairs-result-query',
  GetLatencyByProcessPairs = 'get-latency-process-pairs-result-query',
  GetProcessGroupsLinks = 'get-topology-process-groups-links-query',
  GetProcessGroupMetrics = 'get-topology-process-group-metrics-query'
}
