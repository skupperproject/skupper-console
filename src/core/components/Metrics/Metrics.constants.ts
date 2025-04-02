import { Labels } from '../../../config/labels';
import { defaultTimeInterval } from '../../../config/prometheus';
import { ConfigMetricFilters } from '../../../types/Metrics.interfaces';

// default values to enable/disable filters
export const configDefaultFilters: ConfigMetricFilters = {
  sourceSites: { disabled: false, placeholder: Labels.AllSourceSites, hide: false },
  destSites: { disabled: false, placeholder: Labels.AllConnectedSites, hide: false },
  sourceProcesses: { disabled: false, placeholder: Labels.AllSourceProcesses, hide: false },
  destinationProcesses: { disabled: false, placeholder: Labels.AllConnectedProcesses, hide: false },
  protocols: { disabled: false, placeholder: Labels.AllProtocols },
  timeInterval: { disabled: false, placeholder: defaultTimeInterval.seconds }
};
