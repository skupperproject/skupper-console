import { MetricsLabels } from './Metrics.enum';

export const displayIntervalMap = [
  {
    key: 'pause',
    value: 0,
    label: 'Pause'
  },
  {
    key: '20s',
    value: 20 * 1000,
    label: 'every 20s'
  },
  {
    key: '40s',
    value: 40 * 1000,
    label: 'every 40s'
  },
  {
    key: '60s',
    value: 60 * 1000,
    label: 'every 1m'
  },
  {
    key: '120s',
    value: 120 * 1000,
    label: 'every 2m'
  }
];

// default values to enable/disable filters
export const filterOptionsDefault = {
  sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses },
  destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses, hide: false },
  protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault },
  timeIntervals: { disabled: false }
};

export const filterToggleDefault = {
  sourceProcess: false,
  destProcess: false,
  protocol: false,
  timeInterval: false,
  displayInterval: false
};
