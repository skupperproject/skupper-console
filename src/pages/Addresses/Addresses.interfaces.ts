import { AddressResponse, ProcessResponse } from 'API/REST.interfaces';

import { FlowPairBasic } from './services/services.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
}

export interface FlowPairsTableProps {
    connections: FlowPairBasic[];
}
