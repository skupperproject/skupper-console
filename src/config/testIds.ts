export const getTestsIds = {
  loadingView: () => 'sk-loading-view',
  header: () => 'sk-header',
  sitesView: () => 'sk-sites-view',
  componentsView: () => 'sk-components-view',
  processesView: () => 'sk-processes-view',
  processView: (id: string) => `sk-process-view-${id}`,
  processPairsView: (id: string) => `sk-process-pairs-view-${id}`,
  biFlowView: (id: string) => `sk-bi-flow-view-${id}`,
  servicesView: () => 'sk-services-view',
  serviceView: (id: string) => `sk-service-view-${id}`,
  topologyView: () => 'sk-topology-view',
  notFoundView: () => `sk-not-found-view`,
  siteView: (id: string) => `sk-site-view-${id}`,
  componentView: (id: string) => `sk-component-view-${id}`,
  navbarComponent: () => 'sk-nav-bar-component',
  breadcrumbComponent: () => 'sk-breadcrumb'
};
