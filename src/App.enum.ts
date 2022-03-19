export enum ErrorTypes {
  Server = 'Server',
  Connection = 'connection',
}

export enum Labels {
  LoadingTitle = 'Fetching data',
  LoadingMessage = 'The data for the service network is being retrieved. One moment please...',
  LoadingBrandTitle = 'Connect',
  LoadingBrandMessage = 'A Skupper network management and visualization tool.',
  ErrorServerTitle = 'Server Error',
  ErrorServerMessage = 'Skupper network is adjusting to a new or removed link between sites. One moment please.',
  ErrorConnectionTitle = 'Connection error',
  // menu labels
  Network = 'Network',
  Services = 'Services',
  Site = 'Site',
  Deployments = 'Deployments',
  Monitoring = 'Monitoring',
}
