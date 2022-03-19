import React, { useCallback, useEffect, useState } from 'react';

import {
  Flex,
  Select,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
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
import { useNavigate } from 'react-router-dom';

import { RoutesPaths } from '@routes/routes.enum';

import LoadingPage from '../Loading';
import { MAX_WITH_CELL } from './Monitoring.constant';
import { Columns, DeviceStatus, DeviceTypes, QueriesMonitoring } from './Monitoring.enum';
import { Row } from './Monitoring.interfaces';
import { MonitorServices } from './services';
import { Flow } from './services/services.interfaces';

import './Monitoring.scss';

const Monitoring = function () {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>();
  const [expandedRowsIds, setExpandedRowsIds] = useState<string[]>([]);
  const [isOpenTypeFilter, setIsOpenTypeFilter] = useState(false);
  const [filterType, setFilterType] = useState({ selection: '', isPlaceholder: true });
  const { data, isLoading } = useQuery(QueriesMonitoring.getFlows, MonitorServices.fetchFlows, {
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;

    navigate(route);
  }

  const handleCollapse = useCallback(
    (id: string, isExpanding = true) => {
      if (isExpanding) {
        const otherRowsIds = expandedRowsIds.filter((ids) => {
          return ids !== id;
        });
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
    if (data) {
      setRows(buildRows(data));
    }
  }, [data]);
  const isRowExpanded = (row: Flow) => {
    return expandedRowsIds.includes(row.id);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Toolbar id="toolbar-component-managed-toggle-groups" className="pf-m-toggle-group-container">
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
      <TableComposable className="flows-table" aria-label="flows table" borders>
        <Thead>
          <Tr>
            <Th />
            <Th />
            <Th>{Columns.Type}</Th>
            <Th>{Columns.DeviceName}</Th>
            <Th>{Columns.Hostname}</Th>
            <Th>{Columns.SiteName}</Th>
            <Th>{Columns.Protocol}</Th>
            <Th>{Columns.VanAddress}</Th>
            <Th>{Columns.DestinationHost}</Th>
            <Th>{Columns.DestinationPort}</Th>
          </Tr>
        </Thead>
        {rowsFilteredByType(rows, filterType.selection, filterType.isPlaceholder)?.map(
          ({ data: row, details }, rowIndex) => {
            return (
              <Tbody key={row.id} isExpanded={isRowExpanded(row)}>
                <Tr>
                  <Td
                    expand={
                      details
                        ? {
                            rowIndex,
                            isExpanded: isRowExpanded(row),
                            onToggle: () => {
                              return handleCollapse(row.id, isRowExpanded(row));
                            },
                          }
                        : undefined
                    }
                  />
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
                  <Td dataLabel={Columns.Type} className="pf-u-display-flex">
                    <span className="pf-u-mr-sm">
                      {row.rtype.toLocaleLowerCase() === DeviceTypes.Listener ? (
                        <ConnectedIcon />
                      ) : (
                        <PluggedIcon />
                      )}
                    </span>
                    {row.rtype}
                  </Td>
                  <Td dataLabel={Columns.DeviceName}>
                    <Tooltip content={row.name}>
                      <div className="text-ellipsis" style={{ maxWidth: `${MAX_WITH_CELL}px` }}>
                        {row.name}
                      </div>
                    </Tooltip>
                  </Td>
                  <Td dataLabel={Columns.Hostname}>{row.hostname}</Td>
                  <Td dataLabel={Columns.SiteName}>{row.siteName}</Td>
                  <Td dataLabel={Columns.Protocol}>{row.protocol}</Td>
                  <Td dataLabel={Columns.VanAddress}>
                    <Tooltip content={row.van_address}>
                      <div className="text-ellipsis" style={{ maxWidth: `${MAX_WITH_CELL}px` }}>
                        {row.van_address}
                      </div>
                    </Tooltip>
                  </Td>
                  <Td dataLabel={Columns.DestinationHost}>{row.dest_host}</Td>
                  <Td dataLabel={Columns.DestinationPort}>{row.dest_port}</Td>
                </Tr>
                {details ? (
                  <Tr isExpanded={isRowExpanded(row)}>
                    {details ? (
                      <Td dataLabel={`${row.id}`} colSpan={12}>
                        <ExpandableRowContent>
                          <TextContent className="pf-u-mb-md">
                            <Text component={TextVariants.h1}>{details.host}</Text>
                          </TextContent>
                          <Flex>
                            {details.ports.map(({ portSource, portDest }) => {
                              return (
                                <TextContent key={portSource}>
                                  <Text component={TextVariants.small}>
                                    <span>Source Port: {portSource}</span>{' '}
                                    {portDest && (
                                      <span>
                                        is connected to {row.dest_host}:{row.dest_port}:{portDest}
                                      </span>
                                    )}
                                  </Text>
                                </TextContent>
                              );
                            })}
                          </Flex>
                        </ExpandableRowContent>
                      </Td>
                    ) : null}
                  </Tr>
                ) : null}
              </Tbody>
            );
          },
        )}
      </TableComposable>
    </>
  );
};

export default Monitoring;

function buildRows(data: Flow[]): Row[] {
  return data?.flatMap((item) => {
    const details = {
      host: item.flows[0].source_host,
      ports: item.flows.map((block) => {
        return {
          portSource: block.source_port,
          portDest: block.connected_to?.source_port,
        };
      }),
    };

    return { details, data: item, isOpen: false };
  });
}

const rowsFilteredByType = (rows: Row[] | undefined, selection: string, isPlaceholder: boolean) => {
  return rows?.filter(({ data: row }) => {
    return row.rtype.toLowerCase() === selection || isPlaceholder;
  });
};
