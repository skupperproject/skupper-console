import { MetricsLabels } from './Metrics.enum';
import { ConfigMetricFilters } from './Metrics.interfaces';

// default values to enable/disable filters
export const configDefaultFilters: ConfigMetricFilters = {
  sourceSites: { disabled: false, placeholder: MetricsLabels.FilterAllSourceSites, hide: false },
  destSites: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationSites, hide: false },
  sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses, hide: false },
  destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses, hide: false },
  protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault }
};

export const filterToggleDefault = {
  sourceSite: false,
  destSite: false,
  sourceProcess: false,
  destProcess: false,
  protocol: false,
  timeInterval: false
};

export const formatDate = 'yyyy-MM-dd';
export const formatTime = 'H:mm';
