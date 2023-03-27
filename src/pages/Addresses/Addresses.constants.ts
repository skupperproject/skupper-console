import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { HttpFlowPairsColumns, TcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { AddressResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels, AddressesColumnsNames } from './Addresses.enum';

export const AddressesPaths = {
  path: AddressesRoutesPaths.Addresses,
  name: AddressesLabels.Section
};

const viewDetailsColumn = {
  name: '',
  component: 'viewDetailsLinkCell',
  width: 10
};

export const ConnectionsByAddressColumns = [...TcpFlowPairsColumns, viewDetailsColumn];
export const RequestsByAddressColumns = [...HttpFlowPairsColumns, viewDetailsColumn];

export const addressesComponentsTables = {
  AddressNameLinkCell: (props: LinkCellProps<AddressResponse>) =>
    LinkCell({
      ...props,
      type: 'address',
      link: `${AddressesRoutesPaths.Addresses}/${props.data.name}@${props.data.identity}@${props.data.protocol}`
    })
};

export const addressesColumns = [
  {
    name: AddressesColumnsNames.Name,
    prop: 'name' as keyof AddressResponse,
    component: 'AddressNameLinkCell'
  },
  {
    name: AddressesColumnsNames.Protocol,
    prop: 'protocol' as keyof AddressResponse,
    width: 10
  },
  {
    name: AddressesColumnsNames.Servers,
    prop: 'connectorCount' as keyof AddressResponse,
    width: 10
  }
];

export const addressesColumnsWithFlowPairsCounters = [
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
