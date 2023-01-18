import { AddressResponse, FlowPairResponse, ProcessResponse } from 'API/REST.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
    onGetFilters: Function;
    rowsCount: number;
}

export interface FlowPairsTableProps {
    connections: FlowPairResponse[];
    onGetFilters: Function;
    rowsCount: number;
}
