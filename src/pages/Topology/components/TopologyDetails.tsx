import { FC } from 'react';

import { ProcessPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';
import { TopologyMetrics } from '@sk-types/Topology.interfaces';

import EdgeDetails from './EdgeDetails';
import NodeDetails from './NodeDetails';

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
