import { MetricsLabels } from './Metrics.enum';

export const displayIntervalMap = [
  {
    key: 'pause',
    value: 0,
    label: 'Off'
  },
  {
    key: '20s',
    value: 20 * 1000,
    label: '20s'
  },
  {
    key: '40s',
    value: 40 * 1000,
    label: '40s'
  },
  {
    key: '60s',
    value: 60 * 1000,
    label: '1m'
  },
  {
    key: '120s',
    value: 120 * 1000,
    label: '2m'
  }
];

// default values to enable/disable filters
export const filterOptionsDefault = {
  sourceSites: { disabled: false, placeholder: MetricsLabels.FilterAllSourceSites, hide: false },
  destSites: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationSites, hide: false },
  sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses, hide: false },
  destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses, hide: false },
  protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault },
  timeIntervals: { disabled: false }
};

export const filterToggleDefault = {
  sourceSite: false,
  destSite: false,
  sourceProcess: false,
  destProcess: false,
  protocol: false,
  timeInterval: false,
  refreshDataInterval: false
};
