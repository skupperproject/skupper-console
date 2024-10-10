import { SortDirection, TcpStatus } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, EMPTY_VALUE_PLACEHOLDER } from '@config/config';
import SkEndTimeCell from '@core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '@core/components/SkLinkCell';
import { SankeyMetricOptions } from '@core/components/SKSanckeyChart/SkSankey.constants';
import { SkSelectOption } from '@core/components/SkSelect';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import { ServiceResponse, QueryFilters } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { ServicesRoutesPaths, ServicesLabels } from './Services.enum';

export const ServicesPaths = {
  path: ServicesRoutesPaths.Services,
  name: ServicesLabels.Section
};

export const TAB_0_KEY = ServicesLabels.Overview;
export const TAB_1_KEY = ServicesLabels.Servers;
export const TAB_2_KEY = ServicesLabels.Requests;
export const TAB_3_KEY = ServicesLabels.OpenConnections;
export const TAB_4_KEY = ServicesLabels.OldConnections;

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
    }),
  ApplicationProtocolCell: ({ data }: SkLinkCellProps<ServiceResponse>) =>
    data?.observedApplicationProtocols.join(',') || EMPTY_VALUE_PLACEHOLDER
};

// Services Table
export const ServiceColumns: SKTableColumn<ServiceResponse>[] = [
  {
    name: ServicesLabels.RoutingKey,
    prop: 'name',
    customCellName: 'ServiceNameLinkCell'
  },
  {
    name: ServicesLabels.TransportProtocol,
    prop: 'protocol',
    width: 15
  },
  {
    name: ServicesLabels.ApplicationProtocols,
    prop: 'observedApplicationProtocols',
    width: 15
  },
  {
    name: ServicesLabels.Servers,
    prop: 'connectorCount' as keyof ServiceResponse,
    customCellName: 'ProcessCountCell',
    width: 15
  },
  {
    name: ServicesLabels.OpenConnections,
    prop: 'currentFlows' as keyof ServiceResponse,
    width: 15
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime' as keyof ServiceResponse,
    customCellName: 'TimestampCell',
    modifier: 'fitContent',
    width: 15
  }
];

export const servicesSelectOptions: SkSelectOption[] = [
  {
    label: ServicesLabels.RoutingKey,
    id: 'name'
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

export const defaultMetricOption = SankeyMetricOptions[0].id;
