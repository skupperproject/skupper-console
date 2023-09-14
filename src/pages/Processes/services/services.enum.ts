export enum QueriesProcesses {
  GetProcessesPaginated = 'get-processes-paginated-query',
  GetRemoteProcessesPaginated = 'get-remote-processes-paginated-query',
  GetProcesses = 'get-processes-query',
  GetProcess = 'get-process-query',
  GetProcessResult = 'get-process-result-query',
  GetSource = 'get-process-query',
  GetDestination = 'get-destination-process-query',
  GetProcessPairs = 'get-process-pairs',
  GetProcessPairsTx = 'get-process-pairs-tx',
  GetProcessPairsRx = 'get-process-pairs-rx',
  GetFlowPairs = 'get-process-flow-pairs',
  GetHttp = 'get-process-http-pairs',
  GetFlowPair = 'get-process-flow-pair',
  GetServicesByProcessId = 'get-services-by-process-id-query'
}
