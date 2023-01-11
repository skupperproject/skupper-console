import { AddressResponse } from 'API/REST.interfaces';

export const AddressesController = {
    getAddressesWithFlowPairsCounts: (addresses: AddressResponse[]): AddressResponse[] =>
        addresses.map((address) => ({
            ...address,
            totalFlows: Math.floor(address.totalFlows / 2),
            currentFlows: Math.floor(address.currentFlows / 2),
        })),
};
