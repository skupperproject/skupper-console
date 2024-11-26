import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { GraphElementNames, GraphIconKeys } from 'types/Graph.interfaces';

import SkGraph from '../../../core/components/SkGraph';
import SkTable from '../../../core/components/SkTable';
import useListenersAndConnectorsData, {
  aggregateConnectorResponses,
  getBaseName
} from '../hooks/useListenersAndConnectorsData';
import { ServicesController } from '../services';
import { ConnectorColumns, customServiceCells, ListenerColumns } from '../Services.constants';
import { ServicesLabels } from '../Services.enum';

interface ListenerAndConnectorListProps {
  id: string;
  name: string;
}

const ListenerAndConnectorList: FC<ListenerAndConnectorListProps> = function ({ id, name }) {
  const { listeners, connectors } = useListenersAndConnectorsData(id);

  const listenerPairs = listeners.map((item) => ({
    sourceId: item.identity,
    sourceName: item.name,
    siteId: `${item.siteId}-listener`, //-listener avoid to include connectors and processes in the combo
    siteName: item.siteName,
    destinationId: item.addressId,
    destinationName: item.address,
    type: 'SkEmptyNode' as GraphElementNames,
    iconName: 'listener' as GraphIconKeys
  }));

  const aggregatedConnectors = aggregateConnectorResponses(connectors);

  const connectorPairs = aggregatedConnectors.length
    ? aggregatedConnectors.map((item) => ({
        sourceId: item.addressId,
        sourceName: item.address,
        destinationId: `${getBaseName(item.name)}-${item.siteId}-${item.destPort}`,
        destinationName: `${item.name}:${item.destPort}`,
        type: 'SkEmptyNode' as GraphElementNames,
        iconName: 'routingKey' as GraphIconKeys
      }))
    : [
        {
          sourceId: id,
          sourceName: name,
          destinationId: ``,
          destinationName: ``,
          type: 'SkEmptyNode' as GraphElementNames,
          iconName: 'routingKey' as GraphIconKeys
        }
      ];

  const processPairs = connectors.map((item) => ({
    sourceId: `${getBaseName(item.name)}-${item.siteId}-${item.destPort}`,
    sourceName: `${getBaseName(item.name)}:${item.destPort}`,
    siteId: item.siteId,
    siteName: item.siteName,
    destinationId: item.processId,
    destinationName: `${item.target}`,
    type: 'SkEmptyNode' as GraphElementNames,
    iconName: 'connector' as GraphIconKeys
  }));

  const { nodes, edges, combos } = ServicesController.convertPairsTopologyData([
    ...listenerPairs,
    ...connectorPairs,
    ...processPairs
  ]);

  return (
    <Stack hasGutter>
      <StackItem style={{ height: 700 }}>
        <SkGraph nodes={nodes} edges={edges} combos={combos} layout="dagre" />
      </StackItem>

      <StackItem>
        <SkTable
          title={ServicesLabels.Connectors}
          columns={ConnectorColumns}
          rows={aggregatedConnectors}
          customCells={customServiceCells}
          pagination={false}
          alwaysShowPagination={false}
        />
      </StackItem>

      <StackItem>
        <SkTable
          title={ServicesLabels.Listeners}
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

export default ListenerAndConnectorList;
