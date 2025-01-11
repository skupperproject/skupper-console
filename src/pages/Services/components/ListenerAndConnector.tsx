import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { Labels } from '../../../config/labels';
import SkGraph from '../../../core/components/SkGraph';
import SkTable from '../../../core/components/SkTable';
import useListenersAndConnectorsData from '../hooks/useListenersAndConnectorsData';
import { aggregateConnectorResponses, ServicesController } from '../services';
import { ConnectorColumns, customServiceCells, ListenerColumns } from '../Services.constants';

interface ListenerAndConnectorProps {
  id: string;
  name: string;
}

const ListenerAndConnector: FC<ListenerAndConnectorProps> = function ({ id, name }) {
  const { listeners, connectors } = useListenersAndConnectorsData(id);

  // Group connectors that belong to the same site and share the same base name.
  // If multiple processes (e.g., 3 processes) use the same connector, the API returns 3 separate connectors,
  // which need to be grouped together.
  const aggregatedConnectors = aggregateConnectorResponses(connectors);

  const listenerPairs = ServicesController.mapListenersToRoutingKey(listeners);
  const connectorPairs = ServicesController.mapRoutingKeyToAggregatedConnectors(aggregatedConnectors, id, name);
  const processPairs = ServicesController.mapConnectorsToProcesses(connectors); // Generate process pairs

  const { nodes, edges, combos } = ServicesController.convertPairsTopologyData([
    ...listenerPairs,
    ...connectorPairs,
    ...processPairs
  ]);

  return (
    <Stack hasGutter>
      <StackItem style={{ height: 700 }}>
        <SkGraph
          nodes={nodes}
          edges={edges}
          combos={combos}
          layout="dagre"
          savePositions={false}
          excludeBehaviors={['zoom-canvas', 'hover-activate', 'hover-activate-single-edge', 'click-select']}
        />
      </StackItem>

      <StackItem>
        <SkTable
          title={Labels.Connectors}
          columns={ConnectorColumns}
          rows={aggregatedConnectors}
          customCells={customServiceCells}
          pagination={false}
          alwaysShowPagination={false}
        />
      </StackItem>

      <StackItem>
        <SkTable
          title={Labels.Listeners}
          columns={ListenerColumns}
          rows={listeners}
          customCells={customServiceCells}
          pagination={false}
          alwaysShowPagination={false}
        />
      </StackItem>
    </Stack>
  );
};

export default ListenerAndConnector;
