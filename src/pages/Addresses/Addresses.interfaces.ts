import { AddressResponse, FlowPairResponse, ProcessResponse } from 'API/REST.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
    addressId: string;
}

export interface FlowPairsTableProps {
    connections: FlowPairResponse[];
    addressId: string;
    onGetFilters: Function;
    rowsCount: number;
}
