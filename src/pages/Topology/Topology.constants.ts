import { TopologyDisplayOptionsMenu } from '@sk-types/Topology.interfaces';
import { GraphElementNames } from 'types/Graph.interfaces';

import { TopologyLabels, TopologyRoutesPaths } from './Topology.enum';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: TopologyLabels.Topology
};

export const SHOW_LINK_PROTOCOL = 'show-link-protocol';
export const SHOW_LINK_BYTES = 'show-link-bytes';
export const SHOW_LINK_BYTERATE = 'show-link-byterate';
export const SHOW_LINK_LATENCY = 'show-link-latency';
export const SHOW_DEPLOYMENTS = 'show-deployments';
export const SHOW_INBOUND_METRICS = 'show-inbound-metrics';
export const SHOW_LINK_METRIC_DISTRIBUTION = 'show-metric-distribution';
export const SHOW_LINK_METRIC_VALUE = 'show-metric-value';

export const displayOptionsForProcesses: TopologyDisplayOptionsMenu[] = [
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetrics,
    items: [
      {
        key: SHOW_LINK_BYTES,
        value: SHOW_LINK_BYTES,
        label: TopologyLabels.CheckboxShowTotalBytes
      },
      {
        key: SHOW_LINK_BYTERATE,
        value: SHOW_LINK_BYTERATE,
        label: TopologyLabels.CheckboxShowCurrentByteRate
      },
      {
        key: SHOW_LINK_LATENCY,
        value: SHOW_LINK_LATENCY,
        label: TopologyLabels.CheckboxShowLatency
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetricVisualization,
    items: [
      {
        key: SHOW_LINK_METRIC_DISTRIBUTION,
        value: SHOW_LINK_METRIC_DISTRIBUTION,
        label: TopologyLabels.CheckboxShowMetricDistribution
      },
      {
        key: SHOW_LINK_METRIC_VALUE,
        value: SHOW_LINK_METRIC_VALUE,
        label: TopologyLabels.CheckboxShowMetricValue
      },
      {
        key: SHOW_INBOUND_METRICS,
        value: SHOW_INBOUND_METRICS,
        label: TopologyLabels.CheckboxShowLabelReverse
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuOther,
    items: [
      {
        key: SHOW_LINK_PROTOCOL,
        value: SHOW_LINK_PROTOCOL,
        label: TopologyLabels.CheckboxShowProtocol
      },

      {
        key: SHOW_DEPLOYMENTS,
        value: SHOW_DEPLOYMENTS,
        label: TopologyLabels.ShowDeployments
      }
    ]
  }
];

export const SHOW_ROUTER_LINKS = 'show-site-router-links';
export const SHOW_DATA_LINKS = 'show-site-data-links';

export const displayOptionsForSites: TopologyDisplayOptionsMenu[] = [
  {
    title: TopologyLabels.TitleGroupDisplayOptionsLinkType,
    items: [
      {
        key: SHOW_ROUTER_LINKS,
        value: SHOW_ROUTER_LINKS,
        label: TopologyLabels.CheckBoxShowRouterLinks
      },
      {
        key: SHOW_DATA_LINKS,
        value: SHOW_DATA_LINKS,
        label: TopologyLabels.CheckboxShowDataLinks
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetrics,
    items: [
      {
        key: SHOW_LINK_BYTES,
        value: SHOW_LINK_BYTES,
        label: TopologyLabels.CheckboxShowTotalBytes
      },
      {
        key: SHOW_LINK_BYTERATE,
        value: SHOW_LINK_BYTERATE,
        label: TopologyLabels.CheckboxShowCurrentByteRate
      },
      {
        key: SHOW_LINK_LATENCY,
        value: SHOW_LINK_LATENCY,
        label: TopologyLabels.CheckboxShowLatency
      }
    ]
  },
  {
    title: TopologyLabels.TitleGroupDisplayOptionsMenuMetricVisualization,
    items: [
      {
        key: SHOW_LINK_METRIC_DISTRIBUTION,
        value: SHOW_LINK_METRIC_DISTRIBUTION,
        label: TopologyLabels.CheckboxShowMetricDistribution
      },
      {
        key: SHOW_LINK_METRIC_VALUE,
        value: SHOW_LINK_METRIC_VALUE,
        label: TopologyLabels.CheckboxShowMetricValue
      },
      {
        key: SHOW_INBOUND_METRICS,
        value: SHOW_INBOUND_METRICS,
        label: TopologyLabels.CheckboxShowLabelReverse
      }
    ]
  }
];

export const shape: Record<string, GraphElementNames> = {
  bound: 'SkNode',
  unbound: 'SkNodeUnexposed',
  remote: 'SkNodeRemote'
};
