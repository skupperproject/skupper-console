import { FC } from 'react';

import { Flex } from '@patternfly/react-core';
import { useSuspenseQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { ProcessPairsResponse } from '@API/REST.interfaces';
import { SMALL_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { TopologyController } from '@pages/Topology/services';
import { QueriesTopology } from '@pages/Topology/Topology.enum';

import {
  CustomProcessPairCells,
  processesConnectedColumns,
  processesHttpConnectedColumns
} from '../Processes.constants';
import { ProcessesLabels, ProcessesRoutesPaths, QueriesProcesses } from '../Processes.enum';
import { ProcessPairsProps } from '../Processes.interfaces';

const metricQueryParams = {
  fetchBytes: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchByteRate: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchLatency: { groupBy: 'sourceProcess, destProcess' }
};

const ProcessPairs: FC<ProcessPairsProps> = function ({ process: { identity: processId, name: processName } }) {
  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const [{ data: processesPairsRxData }, { data: processesPairsTxData }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, processesPairsRxQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairsResult(processesPairsRxQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, processesPairsTxQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairsResult(processesPairsTxQueryParams),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const { data: metricsTx } = useQuery({
    queryKey: [QueriesTopology.GetBytesByProcessPairs, { sourceProcess: processName }],
    queryFn: () =>
      TopologyController.getMetrics({
        showBytes: true,
        showByteRate: true,
        showLatency: true,
        params: {
          ...metricQueryParams,
          filterBy: { sourceProcess: processName }
        }
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: metricsRx } = useQuery({
    queryKey: [QueriesTopology.GetBytesByProcessPairs, { destProcess: processName }],
    queryFn: () =>
      TopologyController.getMetrics({
        showBytes: true,
        showByteRate: true,
        showLatency: true,
        params: {
          ...metricQueryParams,
          filterBy: { destProcess: processName }
        }
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  const clients = TopologyController.addMetricsToProcessPairs({
    processesPairs: processesPairsRxData,
    metrics: metricsRx,
    prometheusKey: 'sourceProcess',
    processPairsKey: 'sourceName'
  });

  const servers = TopologyController.addMetricsToProcessPairs({
    processesPairs: processesPairsTxData,
    metrics: metricsTx,
    prometheusKey: 'destProcess',
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
    viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
      <Link
        to={`${ProcessesRoutesPaths.Processes}/${data.sourceName}@${data.sourceId}/${ProcessesLabels.ProcessPairs}@${data.identity}@${data.protocol}?type=${ProcessesLabels.ProcessPairs}`}
      >
        view pairs
      </Link>
    )
  };

  return (
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
  );
};

export default ProcessPairs;
