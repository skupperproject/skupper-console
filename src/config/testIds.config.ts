export const getTestsIds = {
  loadingView: () => 'sk-loading-view',
  breadcrumbComponent: () => 'sk-breadcrumb',
  sitesView: () => 'sk-sites-view',
  siteView: (id: string) => `sk-site-view-${id}`,
  processView: (id: string) => `sk-process-view-${id}`
};
