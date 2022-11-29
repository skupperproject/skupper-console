import { ReactNode } from 'react';

import { AddressResponse } from 'API/REST.interfaces';

import { ProcessRow } from './services/services.interfaces';

export interface AddressesTableProps {
    addresses: AddressResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessRow[];
}

export interface LinkCellProps<T> {
    data: T;
    value: ReactNode;
    link: string;
    type?: 'process' | 'site' | 'service' | 'address';
}
