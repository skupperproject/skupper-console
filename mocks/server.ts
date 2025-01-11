import { createServer } from 'miragejs';

import { MockApi } from './server.API';
import { MockApiPaths } from './server.config';

export function loadMockServer() {
  return createServer({
    routes() {
      this.timing = Number(process.env.MOCK_RESPONSE_DELAY) || 0;
      this.pretender.get('*', this.pretender.passthrough);

      this.get('', MockApi.get500Error);
      this.get(MockApiPaths.User, MockApi.getUser);
      this.get(MockApiPaths.Logout, MockApi.logout);
      this.get(MockApiPaths.Sites, MockApi.getSites);
      this.get(MockApiPaths.Site, MockApi.getSite);
      this.get(MockApiPaths.Links, MockApi.getLinks);
      this.get(MockApiPaths.Components, MockApi.getComponents);
      this.get(MockApiPaths.Component, MockApi.getComponent);
      this.get(MockApiPaths.Connectors, MockApi.getConnectors);
      this.get(MockApiPaths.Listeners, MockApi.getListeners);
      this.get(MockApiPaths.Services, MockApi.getServices);
      this.get(MockApiPaths.Service, MockApi.getService);
      this.get(MockApiPaths.ServiceProcessPairs, MockApi.getServiceProcessPairs);
      this.get(MockApiPaths.Processes, MockApi.getProcesses);
      this.get(MockApiPaths.Process, MockApi.getProcess);
      this.get(MockApiPaths.SitePairs, MockApi.getSitePairs);
      this.get(MockApiPaths.ComponentPairs, MockApi.getComponentPairs);
      this.get(MockApiPaths.ProcessPairs, MockApi.getProcessPairs);
      this.get(MockApiPaths.ProcessPair, MockApi.getProcessPair);
      this.get(MockApiPaths.Connections, MockApi.getTcpConnections);
      this.get(MockApiPaths.Connection, MockApi.getTcpConnection);
      this.get(MockApiPaths.ApplicationFlows, MockApi.getHttpRequests);
      this.get(MockApiPaths.ApplicationFlow, MockApi.getHttpRequest);
      this.get(MockApiPaths.PrometheusQuery, MockApi.getPrometheusQuery);
      this.get(MockApiPaths.PrometheusRangeQuery, MockApi.getPrometheusRangeQuery);
    }
  });
}
