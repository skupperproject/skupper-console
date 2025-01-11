import { FC } from 'react';

import EdgeDetails from './EdgeDetails';
import NodeDetails from './NodeDetails';
import { ProcessPairsResponse, ProcessResponse } from '../../../types/REST.interfaces';
import { TopologyMetrics } from '../../../types/Topology.interfaces';

export interface TopoloyDetailsProps {
  ids?: string[];
  items: ProcessResponse[] | ProcessPairsResponse[];
  metrics: TopologyMetrics;
  modalType: 'process' | 'processPair';
}

const TopologyDetails: FC<TopoloyDetailsProps> = function ({ ids, items, metrics, modalType }) {
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
