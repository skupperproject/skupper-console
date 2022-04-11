import React, { memo, useCallback, useEffect, useState } from 'react';

import { Chart, ChartAxis, ChartBar, ChartThemeColor } from '@patternfly/react-charts';
import { Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { CircleIcon, ConnectedIcon, PluggedIcon } from '@patternfly/react-icons';
import {
  ExpandableRowContent,
  InnerScrollContainer,
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
import { formatBytes } from '@utils/formatBytes';
import { formatTime } from '@utils/formatTime';
import { UPDATE_INTERVAL } from 'config';

import { MAX_HEIGHT_DETAILS_TABLE, MAX_WIDTH_DETAILS_TABLE } from '../../../Monitoring.constant';
import { ConnectionColumns, ConnectionStatus, QueriesMonitoring } from '../../../Monitoring.enum';
import { Port, Row } from '../../../Monitoring.interfaces';
import { MonitorServices } from '../../../services';
import { Flow } from '../../../services/services.interfaces';

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

  return <ConnectionsTable rows={rows} />;
};

export default ConnectionsTableVIew;

const ConnectionsTable = memo(function ({ rows }: { rows: Row<Flow>[] }) {
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

  useEffect(() => {
    if (rows.length) {
      setExpandedRowsIds([rows[0].data.id]);
    }
  }, []);

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
                      <DeviceDetailsTable
                        ports={details.ports}
                        totalBytes={details.totalBytes}
                        totalBytesIn={details.totalBytesIn}
                      />
                    </SplitItem>
                    <SplitItem style={{ width: MAX_WIDTH_DETAILS_TABLE }}>
                      <DeviceTrafficChart ports={details.ports} />
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

const DeviceDetailsTable = function ({
  ports,
  totalBytes,
  totalBytesIn,
}: {
  ports: Port[];
  totalBytes: number;
  totalBytesIn: number;
}) {
  return (
    <InnerScrollContainer>
      <TableComposable
        isStickyHeader
        className="flows-table"
        aria-label="flows table"
        borders
        variant="compact"
        gridBreakPoint=""
      >
        <Thead hasNestedHeader>
          <Tr>
            <Th hasRightBorder>{ConnectionColumns.ConnectionStatus}</Th>
            <Th hasRightBorder colSpan={3}>
              {ConnectionColumns.ConnectorFlow}
            </Th>

            <Th hasRightBorder colSpan={3}>
              {ConnectionColumns.ListenerFlow}
            </Th>
          </Tr>
          <Tr>
            <Th hasRightBorder />
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.Traffic}
            </Th>
            <Th hasRightBorder width={10} isSubheader>
              {ConnectionColumns.TrafficPercentage}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.Latency}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.TrafficIn}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.TrafficPercentage}
            </Th>
            <Th hasRightBorder isSubheader>
              {ConnectionColumns.LatencyIn}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {ports.map(({ id, octets, latency, latencyIn, endTime, octetsIn }) => (
            <Tr key={id}>
              <Th hasRightBorder dataLabel={ConnectionColumns.ConnectionStatus}>
                {endTime ? 'Closed' : 'Open'}
              </Th>
              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.Traffic}>
                {formatBytes(octets)}
              </Td>
              <Td
                modifier="fitContent"
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.TrafficPercentage}
              >
                {((octetsIn / totalBytesIn) * 100).toFixed(1)}
              </Td>
              <Th
                hasRightBorder
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.Latency}
              >
                {formatTime(latency)}
              </Th>
              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.TrafficIn}>
                {formatBytes(octetsIn)}
              </Td>
              <Td
                modifier="fitContent"
                className="pf-u-text-align-right"
                dataLabel={ConnectionColumns.TrafficPercentage}
              >
                {((octets / totalBytes) * 100).toFixed(1)}
              </Td>
              <Td className="pf-u-text-align-right" dataLabel={ConnectionColumns.LatencyIn}>
                {formatTime(latencyIn)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </InnerScrollContainer>
  );
};
const DeviceTrafficChart = function ({ ports }: { ports: Port[] }) {
  return (
    <Chart
      ariaDesc="Bytes traffic for each port of the host"
      ariaTitle="Bytes chart"
      domainPadding={{ x: [30, 25] }}
      height={MAX_HEIGHT_DETAILS_TABLE}
      padding={{
        bottom: 35,
        left: 65,
        right: 0,
        top: 40,
      }}
      width={MAX_WIDTH_DETAILS_TABLE}
      themeColor={ChartThemeColor.green}
    >
      <ChartAxis
        style={{
          tickLabels: { fontSize: 10 },
        }}
        tickFormat={(tick) => formatBytes(tick)}
        dependentAxis
      />
      <ChartAxis
        style={{
          axisLabel: {
            padding: 60,
          },
          tickLabels: {
            fontSize: 10,
            padding: 1,
            angle: -45,
            verticalAnchor: 'end',
            textAnchor: 'end',
          },
        }}
      />
      <ChartBar
        data={getBytes(ports)}
        animate={{
          duration: 1000,
          onLoad: { duration: 1000 },
        }}
      />
    </Chart>
  );
};

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
      ports: item.flows.map(({ id, connectedTo, sourcePort, octets, endTime, latency }) => ({
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

// const rowsFilteredByType = (
//   rows: Row<Flow>[] | undefined,
//   selection: string,
//   isPlaceholder: boolean,
// ) => rows?.filter(({ data: row }) => row.rtype.toLowerCase() === selection || isPlaceholder);

const getBytes = (ports: any[]) =>
  ports.map(({ portSource, octets }) => ({
    x: portSource,
    y: octets,
  }));
