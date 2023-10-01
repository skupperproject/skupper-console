import { FC } from 'react';

import { Flex } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse } from '@API/REST.interfaces';
import { SMALL_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkTable from '@core/components/SkTable';

import {
  CustomProcessPairCells,
  processesConnectedColumns,
  processesHttpConnectedColumns
} from '../Processes.constants';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

interface ProcessPairsProps {
  process: ProcessResponse;
}

const ProcessPairs: FC<ProcessPairsProps> = function ({ process: { identity: processId } }) {
  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const { data: processesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsResult, processesPairsTxQueryParams],
    () => RESTApi.fetchProcessesPairsResult(processesPairsTxQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: processesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsResult, processesPairsRxQueryParams],
    () => RESTApi.fetchProcessesPairsResult(processesPairsRxQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const processesPairsRxReverse =
    (processesPairsRxData || []).map((processPairsData) => ({
      ...processPairsData,
      sourceId: processPairsData.destinationId,
      sourceName: processPairsData.destinationName,
      destinationName: processPairsData.sourceName,
      destinationId: processPairsData.sourceId
    })) || [];

  const TCPServers = (processesPairsTxData || []).filter(({ protocol }) => protocol === AvailableProtocols.Tcp);
  const TCPClients = processesPairsRxReverse.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);

  const HTTPServers = (processesPairsTxData || []).filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const HTTPClients = processesPairsRxReverse.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const remoteServers = (processesPairsTxData || []).filter(({ protocol }) => protocol === undefined);
  const remoteClients = processesPairsRxReverse.filter(({ protocol }) => protocol === undefined);

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
          customCells={CustomProcessPairCells}
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
          customCells={CustomProcessPairCells}
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
          customCells={CustomProcessPairCells}
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
          customCells={CustomProcessPairCells}
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
          customCells={CustomProcessPairCells}
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
          customCells={CustomProcessPairCells}
        />
      )}
    </Flex>
  );
};

export default ProcessPairs;
