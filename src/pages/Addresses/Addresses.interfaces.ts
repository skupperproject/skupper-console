import { AddressResponse } from 'API/REST.interfaces';

import { FlowPairBasic, ProcessRow } from './services/services.interfaces';

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

export interface SiteNameLinkCellProps {
    data: FlowPairBasic;
    value: FlowPairBasic[keyof FlowPairBasic];
}

export interface ProcessNameLinkCellProps {
    data: FlowPairBasic;
    value: FlowPairBasic[keyof FlowPairBasic];
}
