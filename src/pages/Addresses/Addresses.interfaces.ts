import { AddressResponse } from 'API/REST.interfaces';

import { ProcessRow } from './services/services.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessRow[];
}
