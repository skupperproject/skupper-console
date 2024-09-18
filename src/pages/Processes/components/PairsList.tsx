import { FC, useMemo } from 'react';

import { Card, Flex } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { SMALL_PAGINATION_SIZE } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import SKEmptyData from '@core/components/SkEmptyData';
import SkTable from '@core/components/SkTable';
import { TopologyController } from '@pages/Topology/services';
import { ProcessPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';
import { SKTableColumn } from '@sk-types/SkTable.interfaces';

import { useProcessPairsListData } from '../hooks/useProcessPairsListData';
import { CustomPairsCells, processesConnectedColumns, processesHttpConnectedColumns } from '../Processes.constants';
import { ProcessesLabels } from '../Processes.enum';
import { filterPairsByProtocols, invertProcessPairsList } from '../Processes.utls';

interface PairsListProps {
  process: ProcessResponse;
}

const PairsList: FC<PairsListProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useProcessPairsListData(id, name);

  const clients = invertProcessPairsList(
    TopologyController.addMetricsToPairs({
      processesPairs: pairsRx,
      metrics: metricsRx,
      prometheusKey: PrometheusLabelsV2.SourceProcess,
      processPairsKey: 'sourceName'
    })
  );

  const servers = TopologyController.addMetricsToPairs({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestProcess,
    processPairsKey: 'destinationName'
  });
  const { TCPClients, TCPServers, HTTPClients, HTTPServers, remoteClients, remoteServers } = useMemo(
    () => filterPairsByProtocols(clients, servers),
    [clients, servers]
  );

  const renderTable = (title: string, rows: ProcessPairsResponse[], columns: SKTableColumn<ProcessPairsResponse>[]) =>
    !!rows.length && (
      <SkTable
        alwaysShowPagination={false}
        title={title}
        columns={columns}
        rows={rows}
        pagination={true}
        paginationPageSize={SMALL_PAGINATION_SIZE}
        customCells={CustomPairsCells}
      />
    );

  return (
    <>
      {!TCPClients.length &&
        !TCPServers.length &&
        !HTTPClients.length &&
        !HTTPServers.length &&
        !remoteClients.length &&
        !remoteServers.length && (
          <Card isFullHeight>
            <SKEmptyData icon={SearchIcon} />
          </Card>
        )}

      <Flex direction={{ default: 'column' }}>
        {renderTable(ProcessesLabels.TCPClients, TCPClients, processesConnectedColumns)}
        {renderTable(ProcessesLabels.TCPServers, TCPServers, processesConnectedColumns)}
        {renderTable(ProcessesLabels.HTTPClients, HTTPClients, processesHttpConnectedColumns)}
        {renderTable(ProcessesLabels.HTTPServers, HTTPServers, processesHttpConnectedColumns)}
        {renderTable(ProcessesLabels.RemoteClients, remoteClients, processesConnectedColumns)}
        {renderTable(ProcessesLabels.RemoteServers, remoteServers, processesConnectedColumns)}
      </Flex>
    </>
  );
};

export default PairsList;
