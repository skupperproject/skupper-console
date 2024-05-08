import { CUSTOM_ITEMS_NAMES } from '@core/components/Graph/Graph.constants';

import { TopologyLabels, TopologyRoutesPaths } from './Topology.enum';
import { DisplaySelectProps } from './Topology.interfaces';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: TopologyLabels.Topology
};

export const SHOW_SITE_KEY = 'showSite';
export const SHOW_LINK_PROTOCOL = 'show-link-protocol';
export const SHOW_LINK_BYTES = 'show-link-bytes';
export const SHOW_LINK_BYTERATE = 'show-link-byterate';
export const SHOW_LINK_LATENCY = 'show-link-latency';
export const SHOW_LINK_REVERSE_LABEL = 'show-reverse-link-label';
export const ROTATE_LINK_LABEL = 'show-link-label-rotated';

export const displayOptionsForProcesses: DisplaySelectProps[] = [
  {
    key: SHOW_SITE_KEY,
    value: SHOW_SITE_KEY,
    label: TopologyLabels.CheckboxShowSite
  },
  {
    key: SHOW_LINK_PROTOCOL,
    value: SHOW_LINK_PROTOCOL,
    label: TopologyLabels.CheckboxShowProtocol
  },
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
  },
  {
    key: SHOW_LINK_REVERSE_LABEL,
    value: SHOW_LINK_REVERSE_LABEL,
    label: TopologyLabels.CheckboxShowLabelReverse,
    addSeparator: true
  },
  {
    key: ROTATE_LINK_LABEL,
    value: ROTATE_LINK_LABEL,
    label: TopologyLabels.CheckboxRotateLabel
  }
];

export const SHOW_ROUTER_LINKS = 'show-site-router-links';
export const SHOW_DATA_LINKS = 'show-site-data-links';

export const displayOptionsForSites: DisplaySelectProps[] = [
  {
    key: SHOW_ROUTER_LINKS,
    value: SHOW_ROUTER_LINKS,
    label: TopologyLabels.CheckBoxShowRouterLinks
  },
  {
    key: SHOW_DATA_LINKS,
    value: SHOW_DATA_LINKS,
    label: TopologyLabels.CheckboxShowDataLinks,
    addSeparator: true
  },
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
  },
  {
    key: SHOW_LINK_REVERSE_LABEL,
    value: SHOW_LINK_REVERSE_LABEL,
    label: TopologyLabels.CheckboxShowLabelReverse,
    addSeparator: true
  },
  {
    key: ROTATE_LINK_LABEL,
    value: ROTATE_LINK_LABEL,
    label: TopologyLabels.CheckboxRotateLabel
  }
];

export const shape = {
  bound: CUSTOM_ITEMS_NAMES.nodeWithBadges,
  unbound: 'diamond'
};
