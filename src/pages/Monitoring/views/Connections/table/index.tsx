import React, { memo, useCallback, useEffect, useState } from 'react';

import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { CircleIcon, ConnectedIcon, PluggedIcon } from '@patternfly/react-icons';
import {
  ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import TrafficChart from '@pages/Sites/views/Overview/components/TrafficChart';
import { ChartThemeColors } from '@pages/Sites/views/Overview/components/TrafficChart/TrafficChart.enum';
import { formatBytes } from '@utils/formatBytes';
import { UPDATE_INTERVAL } from 'config';

import { MAX_HEIGHT_DETAILS_TABLE, MAX_WIDTH_DETAILS_TABLE } from '../../../Monitoring.constant';
import { ConnectionColumns, ConnectionStatus } from '../../../Monitoring.enum';
import { Row } from '../../../Monitoring.interfaces';
import { MonitorServices } from '../../../services';
import { QueriesMonitoring } from '../../../services/services.enum';
import { Flow } from '../../../services/services.interfaces';
import ConnectionDetailsTable from './Details';

const ConnectionsTableVIew = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [rows, setRows] = useState<Row<Flow>[]>();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading, dataUpdatedAt } = useQuery(
    [QueriesMonitoring.GetMonitoringConnectionsByServiceName, vanId],
    () => MonitorServices.fetchConnectionsByVanId(vanId),
    {
      refetchInterval,
      onError: handleError,
    },
  );

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  useEffect(() => {
    if (data) {
      setRows(buildRows(data));
    }
  }, [data, dataUpdatedAt]);

  useEffect(() => () => setRefetchInterval(0), []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!rows) {
    return null;
  }

  return <ConnectionsTable rows={rows} dataUpdatedAt={dataUpdatedAt} />;
};

export default ConnectionsTableVIew;

const ConnectionsTable = memo(function ({
  rows,
  dataUpdatedAt,
}: {
  rows: Row<Flow>[];
  dataUpdatedAt: number;
}) {
  const [expandedRowsIds, setExpandedRowsIds] = useState<string[]>([]);

  const isRowExpanded = (row: Flow) => expandedRowsIds.includes(row.id);

  const handleCollapse = useCallback(
    (id: string, isExpanding = true) => {
      if (isExpanding) {
        const otherRowsIds = expandedRowsIds.filter((ids) => ids !== id);
        setExpandedRowsIds(otherRowsIds);

        return;
      }
      setExpandedRowsIds([...expandedRowsIds, id]);
    },
    [expandedRowsIds],
  );

  return (
    <TableComposable
      className="flows-table"
      aria-label="flows table"
      variant="compact"
      isStickyHeader
    >
      <Thead>
        <Tr>
          <Th />
          <Th />
          <Th>{ConnectionColumns.Protocol}</Th>
          <Th>{ConnectionColumns.Hostname}</Th>
          <Th>{ConnectionColumns.Connections}</Th>
          <Th>{ConnectionColumns.From}</Th>
          <Th>{ConnectionColumns.TotalBytes}</Th>
          <Th>{ConnectionColumns.To}</Th>
          <Th>{ConnectionColumns.TotalBytesIn}</Th>
        </Tr>
      </Thead>
      {rows?.map(({ data: row, details, totalBytes, totalBytesIn }, rowIndex) => (
        <Tbody key={row.id} isExpanded={isRowExpanded(row)}>
          <Tr>
            <Td
              expand={
                details
                  ? {
                      rowIndex,
                      isExpanded: isRowExpanded(row),
                      onToggle: () => handleCollapse(row.id, isRowExpanded(row)),
                    }
                  : undefined
              }
            />
            <Td>
              <Tooltip
                content={
                  row.flows.every((flow) => flow.endTime)
                    ? ConnectionStatus.AllFlowsClosed
                    : ConnectionStatus.SomeFlowsOpen
                }
              >
                <CircleIcon
                  color={
                    row.flows.every((flow) => flow.endTime)
                      ? 'var(--pf-global--BackgroundColor--200)'
                      : 'var(--pf-global--success-color--100)'
                  }
                />
              </Tooltip>
            </Td>
            <Td dataLabel={ConnectionColumns.Protocol}>{row.protocol}</Td>
            <Td dataLabel={ConnectionColumns.Hostname}>{row.hostname}</Td>
            <Td dataLabel={ConnectionColumns.Connections}>{`${row.flows.length}`}</Td>
            <Td dataLabel={ConnectionColumns.From}>
              <Tooltip content={`${row.name} (${row.siteName})`}>
                <div>
                  <span className="pf-u-mr-sm">
                    <PluggedIcon />
                  </span>
                  {`${row.name} (${row.siteName})`}
                </div>
              </Tooltip>
            </Td>
            <Td dataLabel={ConnectionColumns.TotalBytes}>{formatBytes(totalBytes)}</Td>
            <Td dataLabel={ConnectionColumns.To} className="pf-u-display-flex">
              <span className="pf-u-mr-sm">
                <ConnectedIcon />
              </span>
              {row.deviceNameConnectedTo}
            </Td>
            <Td dataLabel={ConnectionColumns.TotalBytesIn}>{formatBytes(totalBytesIn)}</Td>
          </Tr>
          {details ? (
            <Tr isExpanded={isRowExpanded(row)}>
              <Td dataLabel={`${row.id}`} colSpan={12}>
                <ExpandableRowContent>
                  <Split
                    hasGutter
                    style={{
                      height: MAX_HEIGHT_DETAILS_TABLE,
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <SplitItem isFilled>
                      <ConnectionDetailsTable
                        connection={details.connection}
                        totalBytes={details.totalBytes}
                        totalBytesIn={details.totalBytesIn}
                        connectorName={details.connectorName}
                        listenerName={details.listenerName}
                      />
                    </SplitItem>
                    <SplitItem style={{ width: MAX_WIDTH_DETAILS_TABLE }}>
                      <TrafficChart
                        options={{
                          chartColor: ChartThemeColors.Purple,
                          showLegend: true,
                          dataLegend: [{ name: 'Connector' }, { name: 'Listener' }],
                        }}
                        timestamp={dataUpdatedAt}
                        totalBytesProps={[
                          {
                            name: details.connectorName,
                            totalBytes: details.totalBytes,
                          },
                          {
                            name: details.listenerName,
                            totalBytes: details.totalBytesIn,
                          },
                        ]}
                      />
                    </SplitItem>
                  </Split>
                </ExpandableRowContent>
              </Td>
            </Tr>
          ) : null}
        </Tbody>
      ))}
    </TableComposable>
  );
});

function buildRows(data: Flow[]): Row<Flow>[] {
  return data?.flatMap((item) => {
    const totalBytes = item.flows.reduce((acc, flow) => (acc += flow.octets), 0);
    const totalBytesIn = item.flows.reduce(
      (acc, flow) => (acc += flow.connectedTo?.octets || 0),
      0,
    );

    const avgLatency =
      item.flows.reduce((acc, flow) => (acc += flow.latency), 0) / item.flows.length || 0;

    if (!item.flows.length) {
      return { data: item, totalBytes, totalBytesIn, avgLatency };
    }

    const details = {
      host: item.flows[0]?.sourceHost,
      totalBytes,
      totalBytesIn,
      connectorName: item.name,
      listenerName: item.deviceNameConnectedTo,
      connection: item.flows.map(({ id, connectedTo, sourcePort, octets, endTime, latency }) => ({
        id,
        portSource: sourcePort,
        portDest: connectedTo?.sourcePort,
        octets,
        octetsIn: connectedTo?.octets || 0,
        endTime,
        latency,
        latencyIn: connectedTo?.latency || 0,
      })),
    };

    return { details, data: item, totalBytes, totalBytesIn, avgLatency };
  });
}
