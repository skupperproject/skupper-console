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
    label: 'Client sites',
    id: 'clientSite'
  },
  {
    label: 'Client processes',
    id: 'client'
  }
];

export const ServiceServerResourceOptions: { label: string; id: 'server' | 'serverSite' }[] = [
  {
    label: 'Server sites',
    id: 'serverSite'
  },
  {
    label: 'Server processes',
    id: 'server'
  }
];
