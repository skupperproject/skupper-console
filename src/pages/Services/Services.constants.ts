import { SortDirection, TcpStatus } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE } from '@config/config';
import SkEndTimeCell from '@core/components/SkEndTimeCell';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@core/components/SkFlowPairsTable/FlowPair.constants';
import { FlowPairLabels } from '@core/components/SkFlowPairsTable/FlowPair.enum';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { sankeyMetricOptions } from '@core/components/SKSanckeyChart/SkSankey.constants';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import { ServiceResponse, ProcessResponse, QueryFilters } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { ServicesRoutesPaths, ServicesLabels } from './Services.enum';

export const ServicesPaths = {
  path: ServicesRoutesPaths.Services,
  name: ServicesLabels.Section
};

export const customServiceCells = {
  ServiceNameLinkCell: (props: SkLinkCellProps<ServiceResponse>) =>
    SkLinkCell({
      ...props,
      type: 'service',
      link: `${ServicesRoutesPaths.Services}/${props.data.name}@${props.data.identity}`
    }),
  TimestampCell: SkEndTimeCell,
  ProcessCountCell: (props: SkLinkCellProps<ServiceResponse>) =>
    SkLinkCell({
      ...props,
      fitContent: true,
      link: `${ServicesRoutesPaths.Services}/${props.data.name}@${props.data.identity}?type=${ServicesLabels.Servers}`
    })
};

// Services Table
export const ServiceColumns: SKTableColumn<ServiceResponse>[] = [
  {
    name: ServicesLabels.Name,
    prop: 'name',
    customCellName: 'ServiceNameLinkCell'
  },
  {
    name: ServicesLabels.Protocol,
    prop: 'protocol',
    width: 15
  },
  {
    name: ServicesLabels.Servers,
    prop: 'connectorCount' as keyof ServiceResponse,
    customCellName: 'ProcessCountCell',
    width: 15
  },
  {
    name: ServicesLabels.CurrentFlowPairs,
    columnDescription: 'Open connections',
    prop: 'currentFlows' as keyof ServiceResponse,
    width: 15
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ServiceResponse,
    customCellName: 'TimestampCell',
    width: 15
  }
];

// Server Table
export const tcpServerColumns: SKTableColumn<ProcessResponse>[] = [
  {
    name: ProcessesLabels.Name,
    prop: 'name' as keyof ProcessResponse,
    customCellName: 'linkCell'
  },
  {
    name: ProcessesLabels.Site,
    prop: 'parentName' as keyof ProcessResponse,
    customCellName: 'linkCellSite'
  },
  {
    name: ProcessesLabels.Component,
    prop: 'groupName' as keyof ProcessResponse,
    customCellName: 'linkComponentCell'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ProcessResponse,
    customCellName: 'TimestampCell',
    width: 15
  }
];

// Http/2 Table
export const httpColumns = httpFlowPairsColumns;

// Tcp Table
const tcpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairLabels.FlowPairClosed]: {
    show: false
  },
  [FlowPairLabels.To]: {
    show: false
  }
};

export const tcpColumns = tcpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: tcpHiddenColumns[flowPair.name]?.show
}));

export const TAB_0_KEY = ServicesLabels.Overview;
export const TAB_1_KEY = ServicesLabels.Servers;
export const TAB_2_KEY = ServicesLabels.Requests;
export const TAB_3_KEY = ServicesLabels.ActiveConnections;
export const TAB_4_KEY = ServicesLabels.OldConnections;

export const servicesSelectOptions: { name: string; id: string }[] = [
  {
    name: 'Routing key',
    id: 'name'
  },
  {
    name: 'Protocol',
    id: 'protocol'
  }
];

// Filters
export const initActiveConnectionsQueryParams: QueryFilters = {
  state: TcpStatus.Active,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initOldConnectionsQueryParams: QueryFilters = {
  state: TcpStatus.Terminated,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initRequestsQueryParams: QueryFilters = {
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const defaultMetricOption = sankeyMetricOptions[0].id;
