import React, { useCallback, useEffect, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Label,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { CircleIcon, ConnectedIcon, PluggedIcon } from '@patternfly/react-icons';
import {
  Caption,
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

import { MAX_HEIGHT_DETAILS_TABLE, MAX_WITH_CELL } from '../../Monitoring.constant';
import {
  DeviceColumns,
  DeviceLabels,
  DeviceStatus,
  DeviceTypes,
  MonitoringRoutesPaths,
  QueriesMonitoring,
} from '../../Monitoring.enum';
import { Row } from '../../Monitoring.interfaces';
import { MonitorServices } from '../../services';
import { Flow } from '../../services/services.interfaces';

const Pluralize = require('pluralize');

const Devices = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading } = useQuery(
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

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!data) {
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
      <Table rows={buildRows(data)} />
    </>
  );
};

export default Devices;

const Table = function ({ rows }: { rows: Row<Flow>[] }) {
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
      <Toolbar
        id="toolbar-component-managed-toggle-groups"
        className="pf-m-toggle-group-container pf-u-mt-md pf-u-mb-xl"
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
            <Th />
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
                  {row.dest_host}: {row.dest_port}
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
                      <div style={{ height: MAX_HEIGHT_DETAILS_TABLE, overflow: 'hidden' }}>
                        <InnerScrollContainer>
                          <TableComposable
                            className="flows-table"
                            aria-label="flows table"
                            borders
                            variant="compact"
                            gridBreakPoint=""
                          >
                            <Caption>
                              The host <Label color="blue">{details.host}</Label> has{' '}
                              {Pluralize(DeviceLabels.FlowDetails, details.ports.length, true)}
                            </Caption>
                            <Thead hasNestedHeader>
                              <Tr>
                                <Th colSpan={2} hasRightBorder>
                                  {DeviceColumns.Ports}
                                </Th>
                                <Th rowSpan={2}>{DeviceColumns.Traffic}</Th>
                                <Th rowSpan={2}>{DeviceColumns.ConnectionState}</Th>
                              </Tr>
                              <Tr>
                                <Th modifier="fitContent" isSubheader>
                                  {DeviceColumns.FromPort}
                                </Th>
                                <Th modifier="fitContent" isSubheader hasRightBorder>
                                  {DeviceColumns.ToPort}
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {details.ports.map(({ id, portSource, portDest, octets }) => (
                                <Tr key={id}>
                                  <Td dataLabel={DeviceColumns.FromPort}>{portSource}</Td>
                                  <Td dataLabel={DeviceColumns.ToPort}>{portDest}</Td>
                                  <Td dataLabel={DeviceColumns.Traffic}>{octets}</Td>
                                  <Td dataLabel={DeviceColumns.ConnectionState}>Established</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </TableComposable>
                        </InnerScrollContainer>
                      </div>
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          ),
        )}
      </TableComposable>
    </>
  );
};

function buildRows(data: Flow[]): Row<Flow>[] {
  return data?.flatMap((item) => {
    const details = {
      host: item.flows[0].source_host,
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
