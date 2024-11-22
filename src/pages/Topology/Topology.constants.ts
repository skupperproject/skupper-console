import { GraphElementNames } from 'types/Graph.interfaces';

import { TopologyLabels, TopologyRoutesPaths } from './Topology.enum';
import { SkSelectGroupedOptions } from '../../core/components/SkSelect';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: TopologyLabels.Topology
};

export const SHOW_LINK_BYTES = 'show-link-bytes';
export const SHOW_LINK_BYTERATE = 'show-link-byterate';
export const SHOW_DEPLOYMENTS = 'show-deployments';
export const SHOW_INBOUND_METRICS = 'show-inbound-metrics';
export const SHOW_LINK_METRIC_DISTRIBUTION = 'show-metric-distribution';
export const SHOW_LINK_METRIC_VALUE = 'show-metric-value';

export const displayOptionsForProcesses: SkSelectGroupedOptions[] = [
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetricVisualization,
    items: [
      {
        id: SHOW_LINK_METRIC_DISTRIBUTION,
        label: TopologyLabels.CheckboxShowMetricDistribution
      },
      {
        id: SHOW_LINK_METRIC_VALUE,
        label: TopologyLabels.CheckboxShowMetricValue
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetrics,
    items: [
      {
        id: SHOW_LINK_BYTES,
        label: TopologyLabels.CheckboxShowTotalBytes
      },
      {
        id: SHOW_LINK_BYTERATE,
        label: TopologyLabels.CheckboxShowCurrentByteRate
      }
    ]
  },

  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuOther,
    items: [
      {
        id: SHOW_DEPLOYMENTS,
        label: TopologyLabels.ShowDeployments
      }
    ]
  }
];

export const SHOW_ROUTER_LINKS = 'show-site-router-links';
export const SHOW_DATA_LINKS = 'show-site-data-links';

export const displayOptionsForSites: SkSelectGroupedOptions[] = [
  {
    title: TopologyLabels.TitleGroupDisplayOptionsLinkType,
    items: [
      {
        id: SHOW_ROUTER_LINKS,
        label: TopologyLabels.CheckBoxShowRouterLinks
      },
      {
        id: SHOW_DATA_LINKS,
        label: TopologyLabels.CheckboxShowDataLinks
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetricVisualization,
    items: [
      {
        id: SHOW_LINK_METRIC_DISTRIBUTION,
        label: TopologyLabels.CheckboxShowMetricDistribution
      },
      {
        id: SHOW_LINK_METRIC_VALUE,
        label: TopologyLabels.CheckboxShowMetricValue
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetrics,
    items: [
      {
        id: SHOW_LINK_BYTES,
        label: TopologyLabels.CheckboxShowTotalBytes
      },
      {
        id: SHOW_LINK_BYTERATE,
        label: TopologyLabels.CheckboxShowCurrentByteRate
      }
    ]
  }
];

export const shape: Record<string, GraphElementNames> = {
  bound: 'SkNode',
  unbound: 'SkNodeUnexposed',
  remote: 'SkNodeRemote'
};
