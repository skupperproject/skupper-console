import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatByteRate } from '@core/utils/formatBytes';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessesTableColumns } from '@pages/Processes/Processes.enum';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { FlowPairsColumnsNames } from '@pages/shared/FlowPairs/FlowPairs.enum';
import { AddressResponse, ProcessResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels, AddressesColumnsNames } from './Addresses.enum';

export const AddressesPaths = {
  path: AddressesRoutesPaths.Addresses,
  name: AddressesLabels.Section
};

// Addresses Table
export const customAddressCells = {
  AddressNameLinkCell: (props: LinkCellProps<AddressResponse>) =>
    LinkCell({
      ...props,
      type: 'address',
      link: `${AddressesRoutesPaths.Addresses}/${props.data.name}@${props.data.identity}@${props.data.protocol}`
    })
};

export const addressesColumns: SKColumn<AddressResponse>[] = [
  {
    name: AddressesColumnsNames.Name,
    prop: 'name',
    customCellName: 'AddressNameLinkCell'
  },
  {
    name: AddressesColumnsNames.Protocol,
    prop: 'protocol',
    width: 10
  },
  {
    name: AddressesColumnsNames.Servers,
    prop: 'connectorCount',
    width: 10
  }
];

export const addressesColumnsWithFlowPairsCounters: SKColumn<AddressResponse>[] = [
  ...addressesColumns,
  {
    name: AddressesColumnsNames.CurrentFlowPairs,
    columnDescription: 'Active connection or requests',

    prop: 'currentFlows' as keyof AddressResponse,
    width: 10
  },
  {
    name: AddressesColumnsNames.TotalFLowPairs,
    columnDescription: 'Total connection or requests',

    prop: 'totalFlows' as keyof AddressResponse,
    width: 10
  }
];

// Server Table
export const serverColumns = [
  {
    name: ProcessesTableColumns.Name,
    prop: 'name' as keyof ProcessResponse,
    customCellName: 'linkCell'
  },
  {
    name: ProcessesTableColumns.Component,
    prop: 'groupName' as keyof ProcessResponse,
    customCellName: 'linkComponentCell'
  },
  {
    name: ProcessesTableColumns.Site,
    prop: 'parentName' as keyof ProcessResponse,
    customCellName: 'linkCellSite'
  },
  {
    name: ProcessesTableColumns.ByteRateRx,
    prop: 'byteRate' as keyof ProcessResponse,
    format: formatByteRate
  },
  {
    name: ProcessesTableColumns.Created,
    prop: 'startTime' as keyof ProcessResponse,
    format: timeAgo
  }
];

// Http/2 Table
export const httpColumns = httpFlowPairsColumns;

// Tcp Table
const tcpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairsColumnsNames.Closed]: {
    show: false
  },
  [FlowPairsColumnsNames.To]: {
    show: false
  }
};

export const tcpColumns = tcpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: tcpHiddenColumns[flowPair.name]?.show
}));
