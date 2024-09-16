import { FC } from 'react';

import { Card, Flex } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { SMALL_PAGINATION_SIZE } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import SKEmptyData from '@core/components/SkEmptyData';
import { SkLinkCellProps } from '@core/components/SkLinkCell';
import SkTable from '@core/components/SkTable';
import { TopologyController } from '@pages/Topology/services';
import { ProcessPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';

import { useProcessPairsListData } from '../hooks/useProcessPairsListData';
import {
  CustomProcessPairCells,
  processesConnectedColumns,
  processesHttpConnectedColumns
} from '../Processes.constants';
import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes.enum';

interface ProcessesPairsListProps {
  process: ProcessResponse;
}

const ProcessPairsList: FC<ProcessesPairsListProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx, metricsTx, metricsRx } = useProcessPairsListData(id, name);

  const clients = TopologyController.addMetricsToTopologyDetails({
    processesPairs: pairsRx,
    metrics: metricsRx,
    prometheusKey: PrometheusLabelsV2.SourceProcess,
    processPairsKey: 'sourceName'
  });

  const servers = TopologyController.addMetricsToTopologyDetails({
    processesPairs: pairsTx,
    metrics: metricsTx,
    prometheusKey: PrometheusLabelsV2.DestProcess,
    processPairsKey: 'destinationName'
  });

  const processesPairsRxReverse =
    (clients || []).map((processPairsData) => ({
      ...processPairsData,
      sourceId: processPairsData.destinationId,
      sourceName: processPairsData.destinationName,
      destinationName: processPairsData.sourceName,
      destinationId: processPairsData.sourceId
    })) || [];

  const TCPServers = (servers || []).filter(({ protocol }) => protocol === AvailableProtocols.Tcp);
  const TCPClients = processesPairsRxReverse.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);

  const HTTPServers = (servers || []).filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const HTTPClients = processesPairsRxReverse.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const remoteServers = (servers || []).filter(({ protocol }) => protocol === undefined);
  const remoteClients = processesPairsRxReverse.filter(({ protocol }) => protocol === undefined);

  const CustomProcessPairCellsWithLinkDetail = {
    ...CustomProcessPairCells,
    viewDetailsLinkCell: ({ data }: SkLinkCellProps<ProcessPairsResponse>) => (
      <Link
        to={`${ProcessesRoutesPaths.Processes}/${data.sourceName}@${data.sourceId}/${ProcessesLabels.ProcessPairs}@${data.identity}?type=${ProcessesLabels.ProcessPairs}`}
      >
        view pairs
      </Link>
    )
  };

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
        {!!TCPClients.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.TCPClients}
            columns={processesConnectedColumns}
            rows={TCPClients}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}

        {!!TCPServers.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.TCPServers}
            columns={processesConnectedColumns}
            rows={TCPServers}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}

        {!!HTTPClients.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.HTTPClients}
            columns={processesHttpConnectedColumns}
            rows={HTTPClients}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}

        {!!HTTPServers.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.HTTPServers}
            columns={processesHttpConnectedColumns}
            rows={HTTPServers}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}

        {!!remoteClients.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.RemoteClients}
            columns={processesConnectedColumns}
            rows={remoteClients}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}

        {!!remoteServers.length && (
          <SkTable
            alwaysShowPagination={false}
            title={ProcessesLabels.RemoteServers}
            columns={processesConnectedColumns}
            rows={remoteServers}
            pagination={true}
            paginationPageSize={SMALL_PAGINATION_SIZE}
            customCells={CustomProcessPairCellsWithLinkDetail}
          />
        )}
      </Flex>
    </>
  );
};

export default ProcessPairsList;
