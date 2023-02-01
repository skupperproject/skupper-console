import {
    HttpFlowPairsColumns,
    TcpFlowPairsColumns,
} from '@pages/shared/FlowPairs/FlowPairs.constant';

import { AddressesRoutesPaths, AddressesLabels } from './Addresses.enum';

export const AddressesPaths = {
    path: AddressesRoutesPaths.Addresses,
    name: AddressesLabels.Section,
};

const viewDetailsColumn = {
    name: '',
    component: 'viewDetailsLinkCell',
    width: 10,
};

export const ConnectionsByAddressColumns = [...TcpFlowPairsColumns, viewDetailsColumn];
export const RequestsByAddressColumns = [...HttpFlowPairsColumns, viewDetailsColumn];
