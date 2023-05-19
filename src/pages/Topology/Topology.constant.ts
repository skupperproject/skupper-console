import { GraphData } from '@antv/g6';

import { legendTypeConfigs } from '@core/components/Graph/config';

import { Labels, TopologyRoutesPaths } from './Topology.enum';

export const TopologyPaths = {
  path: TopologyRoutesPaths.Topology,
  name: Labels.Topology
};

export const legendData: GraphData = {
  nodes: [
    {
      id: 'type1',
      label: Labels.Process,
      order: 2,
      ...legendTypeConfigs.type1
    },
    {
      id: 'type2',
      label: Labels.ProcessExposed,
      order: 1,
      ...legendTypeConfigs.type2
    },
    {
      id: 'type3',
      label: Labels.Site,
      order: 0,
      ...legendTypeConfigs.type3
    },
    {
      id: 'type4',
      label: Labels.ServerSite,
      order: 4,
      ...legendTypeConfigs.type4
    }
  ]
};
