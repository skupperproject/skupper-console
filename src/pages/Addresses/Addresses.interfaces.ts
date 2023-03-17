import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
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

export interface ChartData {
  name: string;
  x: string;
  y: number;
}
export interface ChartProps {
  data: ChartData[];
  options?: { themeColor?: string; format?: Function };
}

export interface RequestsByAddressProps {
  addressName: string;
  addressId: string;
}

export type ConnectionsByAddressProps = RequestsByAddressProps;
