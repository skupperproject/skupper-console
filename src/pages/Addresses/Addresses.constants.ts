import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { FlowPairsColumnsNames } from '@pages/shared/FlowPairs/FlowPairs.enum';
import { AddressResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels, AddressesColumnsNames } from './Addresses.enum';

export const AddressesPaths = {
  path: AddressesRoutesPaths.Addresses,
  name: AddressesLabels.Section
};

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
    component: 'AddressNameLinkCell'
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
    width: 15
  },
  {
    name: AddressesColumnsNames.TotalFLowPairs,
    columnDescription: 'Total connection or requests',

    prop: 'totalFlows' as keyof AddressResponse,
    width: 15
  }
];

const tcpHiddenColumns: Record<string, { show: boolean }> = {
  [FlowPairsColumnsNames.Closed]: {
    show: false
  },
  [FlowPairsColumnsNames.To]: {
    show: false
  }
};

export const httpColumns = httpFlowPairsColumns;
export const tcpColumns = tcpFlowPairsColumns.map((flowPair) => ({
  ...flowPair,
  show: tcpHiddenColumns[flowPair.name]?.show
}));
