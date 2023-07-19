import { GraphData } from '@antv/g6';

import { legendTypeConfigs } from '@core/components/Graph/config';

import { TopologyLabels, TopologyRoutesPaths } from './Topology.enum';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: TopologyLabels.Topology
};

export const ProcessLegendData: GraphData = {
  nodes: [
    {
      id: 'type1',
      label: TopologyLabels.Process,
      order: 3,
      ...legendTypeConfigs.type1
    },
    {
      id: 'type2',
      label: TopologyLabels.ProcessExposed,
      order: 2,
      ...legendTypeConfigs.type2
    },
    {
      id: 'type3',
      label: TopologyLabels.Site,
      order: 0,
      ...legendTypeConfigs.type3
    },
    {
      id: 'type4',
      label: TopologyLabels.ServerSite,
      order: 1,
      ...legendTypeConfigs.type4
    }
  ],
  edges: [
    {
      id: 'eType1',
      label: TopologyLabels.Link,
      ...legendTypeConfigs.eType1
    },
    {
      id: 'eType2',
      label: TopologyLabels.ActiveLink,
      ...legendTypeConfigs.eType2
    }
  ]
};
