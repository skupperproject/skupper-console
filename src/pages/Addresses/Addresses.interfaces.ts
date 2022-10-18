import { AddressResponse } from 'API/REST.interfaces';

import { ProcessRow } from './services/services.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface AddressNameLinkCellProps {
    data: AddressResponse;
    value: AddressResponse[keyof AddressResponse];
}

export interface ProcessesTableProps {
    processes: ProcessRow[];
}
