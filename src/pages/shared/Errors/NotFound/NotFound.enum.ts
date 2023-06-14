export enum NotFoundRoutesPaths {
  NotFound = '*', //The global route '*' is used to handle cases where the requested page is not found
  ErrClient = '/error-clients'
}

export enum Labels {
  ErrorServerTitle = 'Page not found',
  ErrorServerMessage = 'The feature is disabled or need to activate a plugin',
  ErrorBrandMessage = 'A network management and visualization tool.'
}
