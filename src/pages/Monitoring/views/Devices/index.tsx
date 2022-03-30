import React, { memo, useCallback, useEffect, useState } from 'react';

import { Chart, ChartAxis, ChartBar, ChartThemeColor } from '@patternfly/react-charts';
import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Card,
  Label,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
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
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import {
  MAX_HEIGHT_DETAILS_TABLE,
  MAX_WIDTH_DETAILS_TABLE,
  MAX_WITH_CELL,
} from '../../Monitoring.constant';
import {
  DeviceColumns,
  DeviceStatus,
  DeviceTypes,
  MonitoringRoutesPaths,
  QueriesMonitoring,
} from '../../Monitoring.enum';
import { Port, Row } from '../../Monitoring.interfaces';
import { MonitorServices } from '../../services';
import { Flow } from '../../services/services.interfaces';

const Devices = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [rows, setRows] = useState<Row<Flow>[]>();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading, dataUpdatedAt } = useQuery(
    [QueriesMonitoring.GetFlows, vanId],
    () => MonitorServices.fetchFlowsByVanId(vanId),
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

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!rows) {
    return null;
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>
          {/* React query doesn't cache the result using directly the prop to from the BreadcrumbItem*/}
          <Link to={MonitoringRoutesPaths.Monitoring}>Monitoring</Link>
        </BreadcrumbItem>
        <BreadcrumbHeading to="#">{vanId}</BreadcrumbHeading>
      </Breadcrumb>
      <DevicesTable rows={rows} />
    </>
  );
};

export default Devices;

const DevicesTable = memo(function ({ rows }: { rows: Row<Flow>[] }) {
  const [expandedRowsIds, setExpandedRowsIds] = useState<string[]>([]);
  const [isOpenTypeFilter, setIsOpenTypeFilter] = useState(false);
  const [filterType, setFilterType] = useState({ selection: '', isPlaceholder: true });

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

  const handleTypeFilterToggle = useCallback(() => {
    setIsOpenTypeFilter(!isOpenTypeFilter);
  }, [isOpenTypeFilter]);

  const handleTypeFilterSelect = useCallback((_event, selection = '', isPlaceholder = true) => {
    setIsOpenTypeFilter(false);
    setFilterType({ selection, isPlaceholder });
  }, []);

  useEffect(() => {
    setExpandedRowsIds([rows[0].data.id]);
  }, []);

  return (
    <>
      <Card className="pf-u-mb-xl pf-u-mt-md">
        <Toolbar
          id="toolbar-component-managed-toggle-groups"
          className="pf-m-toggle-group-container"
        >
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <Select
                  isOpen={isOpenTypeFilter}
                  variant={SelectVariant.single}
                  onSelect={handleTypeFilterSelect}
                  onToggle={handleTypeFilterToggle}
                  selections={filterType.selection}
                >
                  <SelectOption key={0} value="Select a Device" isPlaceholder />
                  <SelectOption key={1} value={DeviceTypes.Listener} />
                  <SelectOption key={2} value={DeviceTypes.Connector} />
                </Select>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </Card>
      <Card>
        <TableComposable
          className="flows-table"
          aria-label="flows table"
          borders
          variant="compact"
          isStickyHeader
        >
          <Thead>
            <Tr>
              <Th />
              <Th>{DeviceColumns.SiteName}</Th>
              <Th>{DeviceColumns.Type}</Th>
              <Th>{DeviceColumns.DeviceName}</Th>
              <Th>{DeviceColumns.Hostname}</Th>
              <Th>{DeviceColumns.Protocol}</Th>
              <Th>{DeviceColumns.DestinationHost}</Th>
              <Th>{DeviceColumns.DeviceStatus}</Th>
            </Tr>
          </Thead>
          {rowsFilteredByType(rows, filterType.selection, filterType.isPlaceholder)?.map(
            ({ data: row, details }, rowIndex) => (
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
                  <Td dataLabel={DeviceColumns.SiteName}>{row.siteName}</Td>
                  <Td dataLabel={DeviceColumns.Type} className="pf-u-display-flex">
                    <span className="pf-u-mr-sm">
                      {row.rtype.toLocaleLowerCase() === DeviceTypes.Listener ? (
                        <ConnectedIcon />
                      ) : (
                        <PluggedIcon />
                      )}
                    </span>
                    {row.rtype}
                  </Td>
                  <Td dataLabel={DeviceColumns.DeviceName}>
                    <Tooltip content={row.name}>
                      <div className="text-ellipsis" style={{ maxWidth: `${MAX_WITH_CELL}px` }}>
                        {row.name}
                      </div>
                    </Tooltip>
                  </Td>
                  <Td dataLabel={DeviceColumns.Hostname}>{row.hostname}</Td>
                  <Td dataLabel={DeviceColumns.Protocol}>{row.protocol}</Td>
                  <Td dataLabel={DeviceColumns.DestinationHost}>
                    {`${row.dest_host}: ${row.dest_port} -> ${details?.host}`}
                  </Td>
                  <Td>
                    <Tooltip content={DeviceStatus.Connected}>
                      <CircleIcon
                        color={
                          Math.round(Math.random())
                            ? 'var(--pf-global--success-color--100)'
                            : 'var(--pf-global--warning-color--100)'
                        }
                      />
                    </Tooltip>
                  </Td>
                </Tr>
                {details ? (
                  <Tr isExpanded={isRowExpanded(row)}>
                    <Td dataLabel={`${row.id}`} colSpan={12}>
                      <ExpandableRowContent>
                        <Label
                          color="green"
                          className="pf-u-mb-xl"
                        >{`${details.ports.length} Ports connected`}</Label>
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
            ),
          )}
        </TableComposable>
      </Card>
    </>
  );
});

const DeviceDetailsTable = function ({ ports, totalBytes }: { ports: Port[]; totalBytes: number }) {
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
        <Thead>
          <Tr>
            <Th modifier="fitContent" hasRightBorder>
              {DeviceColumns.FromPort}
            </Th>
            <Th modifier="fitContent" hasRightBorder>
              {DeviceColumns.ToPort}
            </Th>
            <Th hasRightBorder>{DeviceColumns.ConnectionState}</Th>
            <Th width={20} hasRightBorder>
              {DeviceColumns.Traffic}
            </Th>
            <Th width={20}>{DeviceColumns.TrafficPercentage}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ports.map(({ id, portSource, portDest, octets }) => (
            <Tr key={id}>
              <Th hasRightBorder dataLabel={DeviceColumns.FromPort}>
                {portSource}
              </Th>
              <Td dataLabel={DeviceColumns.ToPort}>{portDest}</Td>
              <Td dataLabel={DeviceColumns.ConnectionState}>Established</Td>
              <Td className="pf-u-text-align-right" dataLabel={DeviceColumns.Traffic}>
                {formatBytes(octets)}
              </Td>
              <Td className="pf-u-text-align-right" dataLabel={DeviceColumns.Traffic}>
                {((octets / totalBytes) * 100).toFixed(1)}
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
    const details = {
      host: item.flows[0].source_host,
      totalBytes,
      ports: item.flows.map(({ id, connected_to, source_port, octets }) => ({
        id,
        portSource: source_port,
        portDest: connected_to?.source_port,
        octets,
      })),
    };

    return { details, data: item };
  });
}

const rowsFilteredByType = (
  rows: Row<Flow>[] | undefined,
  selection: string,
  isPlaceholder: boolean,
) => rows?.filter(({ data: row }) => row.rtype.toLowerCase() === selection || isPlaceholder);

/**
 *  Converts input bytes in the most appropriate format
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const getBytes = (ports: any[]) =>
  ports.map(({ portSource, octets }) => ({
    x: portSource,
    y: octets,
  }));
