import { SKTableColumn } from 'types/SkTable.interfaces';

import { ServicesRoutesPaths, ServicesLabels } from './Services.enum';
import { SortDirection, TcpStatus } from '../../API/REST.enum';
import { BIG_PAGINATION_SIZE, EMPTY_VALUE_PLACEHOLDER } from '../../config/config';
import SkEndTimeCell from '../../core/components/SkEndTimeCell';
import SkLinkCell, { SkLinkCellProps } from '../../core/components/SkLinkCell';
import { SankeyMetricOptions } from '../../core/components/SKSanckeyChart/SkSankey.constants';
import { SkSelectOption } from '../../core/components/SkSelect';
import SkTrueFalseStatusCell from '../../core/components/SkTrueFalseStatusCell';
import { ServiceResponse, QueryFilters } from '../../types/REST.interfaces';
import { ProcessesLabels } from '../Processes/Processes.enum';

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
  ApplicationProtocolCell: ({ data }: SkLinkCellProps<ServiceResponse>) =>
    data?.observedApplicationProtocols.join(', ') || EMPTY_VALUE_PLACEHOLDER,
  isBoundCell: SkTrueFalseStatusCell
};

// Services Table
export const ServiceColumns: SKTableColumn<ServiceResponse>[] = [
  {
    name: ServicesLabels.Name,
    prop: 'name',
    customCellName: 'ServiceNameLinkCell',
    modifier: 'nowrap'
  },
  {
    name: ServicesLabels.TransportProtocol,
    prop: 'protocol',
    width: 15
  },
  {
    name: ServicesLabels.ApplicationProtocols,
    prop: 'observedApplicationProtocols',
    customCellName: 'ApplicationProtocolCell',
    width: 15
  },
  {
    name: ServicesLabels.IsBound,
    prop: 'isBound',
    customCellName: 'isBoundCell',
    width: 15
  },
  {
    name: ProcessesLabels.Created,
    prop: 'startTime',
    customCellName: 'TimestampCell',
    modifier: 'fitContent',
    width: 15
  }
];

export const servicesSelectOptions: SkSelectOption[] = [
  {
    label: ServicesLabels.Name,
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
