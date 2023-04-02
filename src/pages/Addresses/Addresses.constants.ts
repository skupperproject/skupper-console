import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { HttpFlowPairsColumns, TcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { AddressResponse, FlowPairsResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels, AddressesColumnsNames } from './Addresses.enum';
import { viewDetailsColumnProps } from './Addresses.interfaces';

export const AddressesPaths = {
  path: AddressesRoutesPaths.Addresses,
  name: AddressesLabels.Section
};

const viewDetailsColumn: viewDetailsColumnProps = {
  name: '',
  component: 'viewDetailsLinkCell',
  width: 10
};

export const ConnectionsByAddressColumns: SKColumn<FlowPairsResponse>[] = [...TcpFlowPairsColumns, viewDetailsColumn];
export const RequestsByAddressColumns: SKColumn<FlowPairsResponse>[] = [...HttpFlowPairsColumns, viewDetailsColumn];

export const addressesComponentsTables = {
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
