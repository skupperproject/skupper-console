import { RestResources } from '../src/API/REST.enum';
import { API_VERSION, PROMETHEUS_SUFFIX } from '../src/config/api';

export const MockApiPaths = {
  User: `${API_VERSION}/user`,
  Logout: `${API_VERSION}/logout`,
  Sites: `${API_VERSION}/${RestResources.Sites}`,
  Site: `${API_VERSION}/${RestResources.Sites}/:id`,
  SitePairs: `${API_VERSION}/${RestResources.SiteDataLinks}`,
  Links: `${API_VERSION}/${RestResources.RouterLinks}`,
  Components: `${API_VERSION}/${RestResources.Components}`,
  Component: `${API_VERSION}/${RestResources.Components}/:id`,
  ComponentPairs: `${API_VERSION}/${RestResources.ComponentDataLinks}`,
  Connectors: `${API_VERSION}/${RestResources.Connectors}`,
  Listeners: `${API_VERSION}/${RestResources.Listeners}`,
  Services: `${API_VERSION}/${RestResources.Services}`,
  Service: `${API_VERSION}/${RestResources.Services}/:id`,
  ServiceProcessPairs: `${API_VERSION}/${RestResources.Services}/:id/${RestResources.ProcessDataLinks}`,
  Processes: `${API_VERSION}/${RestResources.Processes}`,
  Process: `${API_VERSION}/${RestResources.Processes}/:id`,
  ProcessPairs: `${API_VERSION}/${RestResources.ProcessDataLinks}`,
  ProcessPair: `${API_VERSION}/${RestResources.ProcessDataLinks}/:id`,
  Connections: `${API_VERSION}/${RestResources.TcpConnections}`,
  Connection: `${API_VERSION}/${RestResources.TcpConnections}/:id`,
  ApplicationFlows: `${API_VERSION}/${RestResources.HttpRequests}`,
  ApplicationFlow: `${API_VERSION}/${RestResources.HttpRequests}/:id`,
  PrometheusQuery: `${API_VERSION}/${PROMETHEUS_SUFFIX}/query/`,
  PrometheusRangeQuery: `${API_VERSION}/${PROMETHEUS_SUFFIX}/rangequery/`
};
