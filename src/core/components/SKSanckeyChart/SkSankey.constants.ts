export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
export const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

// Themes

//Filters
export const sankeyMetricOptions = [
  { id: 'none', name: 'Display only relationships' },
  { id: 'byterate', name: 'Compare avg. byterate (last hour)' }
];

export const ServiceClientResourceOptions: { name: string; id: 'client' | 'clientSite' }[] = [
  {
    name: 'Client sites',
    id: 'clientSite'
  },
  {
    name: 'Client processes',
    id: 'client'
  }
];

export const ServiceServerResourceOptions: { name: string; id: 'server' | 'serverSite' }[] = [
  {
    name: 'Server sites',
    id: 'serverSite'
  },
  {
    name: 'Server processes',
    id: 'server'
  }
];
