import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { VarColors } from '../../../config/colors';
import SkTable from '../../../core/components/SkTable';
import useListenersAndConnectorsData, {
  aggregateConnectorResponses,
  extendConnectorResponses,
  getBaseName
} from '../hooks/useListenersAndConnectorsData';
import { ConnectorColumns, customServiceCells, ListenerColumns } from '../Services.constants';
import { ServicesLabels } from '../Services.enum';
import PairsSankeyChart from './PairsSankeyChart';

interface ListenerAndConnectorListProps {
  id: string;
}

const ListenerAndConnectorList: FC<ListenerAndConnectorListProps> = function ({ id }) {
  const { listeners, connectors, processes } = useListenersAndConnectorsData(id);
  const extendedConnectors = extendConnectorResponses(connectors, processes);
  const aggregatedConnectors = aggregateConnectorResponses(extendedConnectors);

  const clientsPairs = listeners.map((item) => ({
    sourceName: `${item.name}:${item.destPort}`,
    destinationName: `.`
  }));

  const serversPairs = aggregatedConnectors.map((item) => ({
    sourceName: `.`,
    destinationName: `${item.name}:${item.destPort}`
  }));

  const serversProcessesPairs = extendedConnectors.map((item) => ({
    sourceName: `${getBaseName(item.name)}:${item.destPort}`,
    destinationName: `${item.target}`,
    color: VarColors.Black500
  }));

  const pairs = [...clientsPairs, ...serversPairs, ...serversProcessesPairs];

  return (
    <Stack hasGutter>
      <StackItem>
        <PairsSankeyChart pairs={pairs} showFilter={false} />
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
