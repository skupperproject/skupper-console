const API_PREFIX = '/api/v1alpha1';

export const MockApiPaths = {
  User: `${API_PREFIX}/user`,
  Logout: `${API_PREFIX}/logout`,
  Sites: `${API_PREFIX}/sites`,
  Site: `${API_PREFIX}/sites/:id`,
  SitePairs: `${API_PREFIX}/sitepairs`,
  Links: `${API_PREFIX}/routerlinks`,
  Components: `${API_PREFIX}/processgroups`,
  Component: `${API_PREFIX}/processgroups/:id`,
  ComponentPairs: `${API_PREFIX}/processgrouppairs`,
  ComponentPair: `${API_PREFIX}/processgrouppairs/:id`,
  Connectors: `${API_PREFIX}/connectors`,
  Listeners: `${API_PREFIX}/listeners`,
  Services: `${API_PREFIX}/addresses`,
  Service: `${API_PREFIX}/addresses/:id`,
  ServiceProcessPairs: `${API_PREFIX}/addresses/:id/processpairs`,
  Processes: `${API_PREFIX}/processes`,
  Process: `${API_PREFIX}/processes/:id`,
  ProcessPairs: `${API_PREFIX}/processpairs`,
  ProcessPair: `${API_PREFIX}/processpairs/:id`,
  Connections: `${API_PREFIX}/connections`,
  Connection: `${API_PREFIX}/connections/:id`,
  ApplicationFlows: `${API_PREFIX}/applicationflows`,
  ApplicationFlow: `${API_PREFIX}/applicationflows/:id`,
  PrometheusQuery: `${API_PREFIX}/internal/prom/query/`,
  PrometheusRangeQuery: `${API_PREFIX}/internal/prom/rangequery/`
};
