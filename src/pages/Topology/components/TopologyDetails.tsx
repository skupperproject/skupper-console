import { FC } from 'react';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';

import EdgeDetails from './EdgeDetails';
import NodeDetails from './NodeDetails';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const TopologyDetails: FC<NodeOrEdgeListProps> = function ({ ids, items, metrics, modalType }) {
  const filteredItems = items.filter(({ identity }) => ids?.includes(identity));

  return (
    <div style={{ height: 0 }}>
      {modalType === 'process' ? (
        <NodeDetails data={filteredItems as ProcessResponse[]} metrics={metrics} />
      ) : (
        <EdgeDetails data={filteredItems as ProcessPairsResponse[]} metrics={metrics} />
      )}
    </div>
  );
};

export default TopologyDetails;
