export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
export const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

// Themes

//Filters
export const SankeyMetricOptions = [
  { id: 'none', label: 'Display only pairs' },
  { id: 'byterate', label: 'Display avg. byterate (last hour)' }
];

export const ServiceClientResourceOptions: { label: string; id: 'client' | 'clientSite' }[] = [
  {
    label: 'Clients',
    id: 'client'
  },
  {
    label: 'Client sites',
    id: 'clientSite'
  }
];

export const ServiceServerResourceOptions: { label: string; id: 'server' | 'serverSite' }[] = [
  {
    label: 'Servers',
    id: 'server'
  },
  {
    label: 'Server sites',
    id: 'serverSite'
  }
];
