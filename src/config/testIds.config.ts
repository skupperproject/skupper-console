export const getTestsIds = {
  loadingView: () => 'sk-loading-view',
  sitesView: () => 'sk-sites-view',
  notFoundView: () => `sk-not-found-view`,
  siteView: (id: string) => `sk-site-view-${id}`,
  processView: (id: string) => `sk-process-view-${id}`,

  navbarComponent: () => 'sk-nav-bar-component',
  breadcrumbComponent: () => 'sk-breadcrumb'
};
