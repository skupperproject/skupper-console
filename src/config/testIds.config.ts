export const getTestsIds = {
  loadingView: () => 'sk-loading-view',
  sitesView: () => 'sk-sites-view',
  siteView: (id: string) => `sk-site-view-${id}`,
  processView: (id: string) => `sk-process-view-${id}`
};
