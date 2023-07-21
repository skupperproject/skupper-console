import { AvailableProtocols } from '@API/REST.enum';

export interface RequestsByAddressProps {
  addressId: string;
  addressName: string;
  protocol: AvailableProtocols;
  viewSelected: string;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
