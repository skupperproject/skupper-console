import { AvailableProtocols } from '@API/REST.enum';

export interface RequestsByAddressProps {
  addressName: string;
  addressId: string;
  protocol: AvailableProtocols;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
