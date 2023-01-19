import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { AddressResponse, FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

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
