import { GraphElementNames } from 'types/Graph.interfaces';

import { TopologyRoutesPaths } from './Topology.enum';
import { Labels } from '../../config/labels';
import { SkSelectGroupedOptions } from '../../core/components/SkSelect';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: Labels.Topology
};

export const SHOW_LINK_BYTES = 'show-link-bytes';
export const SHOW_LINK_BYTERATE = 'show-link-byterate';
export const SHOW_DEPLOYMENTS = 'show-deployments';
export const SHOW_INBOUND_METRICS = 'show-inbound-metrics';
export const SHOW_LINK_METRIC_DISTRIBUTION = 'show-metric-distribution';
export const SHOW_LINK_METRIC_VALUE = 'show-metric-value';

export const displayOptionsForProcesses: SkSelectGroupedOptions[] = [
  {
    title: Labels.Metrics,
    items: [
      {
        id: SHOW_LINK_BYTES,
        label: Labels.Bytes
      },
      {
        id: SHOW_LINK_BYTERATE,
        label: Labels.ByteRate
      }
    ]
  },

  {
    title: Labels.MetricVisualizationType,
    items: [
      {
        id: SHOW_LINK_METRIC_DISTRIBUTION,
        label: Labels.MetricDistribution
      },
      {
        id: SHOW_LINK_METRIC_VALUE,
        label: Labels.MetricValue
      }
    ]
  },

  {
    title: Labels.Other,
    items: [
      {
        id: SHOW_DEPLOYMENTS,
        label: Labels.DeploymentGroups
      }
    ]
  }
];

export const SHOW_ROUTER_LINKS = 'show-site-router-links';
export const SHOW_DATA_LINKS = 'show-site-data-links';

export const displayOptionsForSites: SkSelectGroupedOptions[] = [
  {
    title: Labels.LinkType,
    items: [
      {
        id: SHOW_ROUTER_LINKS,
        label: Labels.RouterLinks
      },
      {
        id: SHOW_DATA_LINKS,
        label: Labels.Pairs
      }
    ]
  },

  {
    title: Labels.Metrics,
    items: [
      {
        id: SHOW_LINK_BYTES,
        label: Labels.Bytes
      },
      {
        id: SHOW_LINK_BYTERATE,
        label: Labels.ByteRate
      }
    ]
  },

  {
    title: Labels.MetricVisualizationType,
    items: [
      {
        id: SHOW_LINK_METRIC_DISTRIBUTION,
        label: Labels.MetricDistribution
      },
      {
        id: SHOW_LINK_METRIC_VALUE,
        label: Labels.MetricValue
      }
    ]
  }
];

export const shape: Record<string, GraphElementNames> = {
  bound: 'SkNode',
  unbound: 'SkNodeUnexposed',
  remote: 'SkNodeRemote'
};
