import { AddressResponse } from 'API/REST.interfaces';

export const AddressesController = {
    getAddressesWithFlowPairsCounts: (addresses: AddressResponse[]): AddressResponse[] =>
        addresses.map((address) => ({
            ...address,
            totalFlows: Math.ceil(address.totalFlows / 2),
            currentFlows: Math.ceil(address.currentFlows / 2),
        })),
};
