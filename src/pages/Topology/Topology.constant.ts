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
      label: 'process not exposed',
      order: 2,
      ...legendTypeConfigs.type1
    },
    {
      id: 'type2',
      label: 'process',
      order: 1,
      ...legendTypeConfigs.type2
    },
    {
      id: 'type3',
      label: 'site',
      order: 0,
      ...legendTypeConfigs.type3
    }
  ]
};
