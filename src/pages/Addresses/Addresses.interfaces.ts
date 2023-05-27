import { AvailableProtocols } from '@API/REST.enum';
import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

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
  title?: string;
}

export interface RequestsByAddressProps {
  addressName: string;
  addressId: string;
  protocol: AvailableProtocols;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
