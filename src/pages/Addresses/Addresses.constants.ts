import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { HttpFlowPairsColumns, TcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import { AddressResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels } from './Addresses.enum';

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
