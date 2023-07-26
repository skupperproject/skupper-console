export enum QueriesProcesses {
  GetProcessesPaginated = 'get-processes-paginated-query',
  GetRemoteProcessesPaginated = 'get-remote-processes-paginated-query',
  GetProcesses = 'get-processes-query',
  GetProcess = 'get-process-query',
  GetProcessResult = 'get-process-result-query',
  GetSourceProcess = 'get-process-query',
  GetDestinationProcess = 'get-destination-process-query',
  GetProcessPairs = 'get-process-pairs',
  GetProcessPairsTx = 'get-process-pairs-tx',
  GetProcessPairsRx = 'get-process-pairs-rx',
  GetFlowPairs = 'get-process-flow-pairs',
  GetHttp = 'get-process-http-pairs',
  GetFlowPair = 'get-process-flow-pair',
  GetAddressesByProcessId = 'get-services-by-process-id-query'
}
