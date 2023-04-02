import { SKColumn, WidthValue } from '@core/components/SkTable/SkTable.interface';
import { AvailableProtocols } from 'API/REST.enum';
import { FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

export interface viewDetailsColumnProps {
  name: '';
  component: string;
  width: WidthValue;
}
export interface ServerTableProps {
  processes: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface FlowPairsTableProps {
  connections: FlowPairsResponse[];
  columns: SKColumn<FlowPairsResponse>[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface RequestsByAddressProps {
  addressName: string;
  addressId: string;
  protocol: AvailableProtocols;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
