import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse } from 'API/REST.interfaces';

export interface ServerTableProps {
  processes: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface RequestsByAddressProps {
  addressName: string;
  addressId: string;
  protocol: AvailableProtocols;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
