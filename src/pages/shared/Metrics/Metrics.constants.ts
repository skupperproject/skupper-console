import { ConfigMetricFilters } from '@sk-types/Metrics.interfaces';

import { MetricsLabels } from './Metrics.enum';

// default values to enable/disable filters
export const configDefaultFilters: ConfigMetricFilters = {
  sourceSites: { disabled: false, placeholder: MetricsLabels.FilterAllSourceSites, hide: false },
  destSites: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationSites, hide: false },
  sourceProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllSourceProcesses, hide: false },
  destinationProcesses: { disabled: false, placeholder: MetricsLabels.FilterAllDestinationProcesses, hide: false },
  protocols: { disabled: false, placeholder: MetricsLabels.FilterProtocolsDefault }
};
