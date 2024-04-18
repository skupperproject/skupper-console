import { SortDirection, TcpStatus } from '@API/REST.enum';
import { ServiceResponse, ProcessResponse, RemoteFilterOptions } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE } from '@config/config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { sankeyMetricOptions } from '@core/components/SKSanckeyChart/SkSankey.constants';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPair.constants';
import { FlowPairLabels } from '@pages/shared/FlowPairs/FlowPair.enum';

import { ServicesRoutesPaths, ServicesLabels } from './Services.enum';

export const ServicesPaths = {
  path: ServicesRoutesPaths.Services,
  name: ServicesLabels.Section
};

export const customServiceCells = {
  ServiceNameLinkCell: (props: LinkCellProps<ServiceResponse>) =>
    LinkCell({
      ...props,
      type: 'service',
      link: `${ServicesRoutesPaths.Services}/${props.data.name}@${props.data.identity}@${props.data.protocol}`
    })
};

// Services Table
export const ServiceColumns: SKColumn<ServiceResponse>[] = [
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
    prop: 'connectorCount',
    width: 15
  },
  {
    name: ServicesLabels.CurrentFlowPairs,
    columnDescription: 'Live connections',

    prop: 'currentFlows' as keyof ServiceResponse,
    width: 15
  }
];

// Server Table
export const tcpServerColumns = [
  {
    name: ProcessesLabels.Name,
    prop: 'name' as keyof ProcessResponse,
    customCellName: 'linkCell'
  },
  {
    name: ProcessesLabels.Component,
    prop: 'groupName' as keyof ProcessResponse,
    customCellName: 'linkComponentCell'
  },
  {
    name: ProcessesLabels.Site,
    prop: 'parentName' as keyof ProcessResponse,
    customCellName: 'linkCellSite'
  },
  {
    name: ProcessesLabels.ByteRateRx,
    prop: 'byteRate' as keyof ProcessResponse,
    customCellName: 'ByteRateFormatCell'
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ProcessResponse,
    format: timeAgo
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

export const TAB_0_KEY = '0';
export const TAB_1_KEY = '1';
export const TAB_2_KEY = '2';
export const TAB_3_KEY = '3';

export const servicesSelectOptions: { name: string; id: string }[] = [
  {
    name: 'Address',
    id: 'name'
  },
  {
    name: 'Protocol',
    id: 'protocol'
  }
];

// Filters
export const initServersQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  endTime: 0 // active servers
};

export const initActiveConnectionsQueryParams: RemoteFilterOptions = {
  state: TcpStatus.Active,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initOldConnectionsQueryParams: RemoteFilterOptions = {
  state: TcpStatus.Terminated,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const initRequestsQueryParams: RemoteFilterOptions = {
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

export const defaultMetricOption = sankeyMetricOptions[0].id;
