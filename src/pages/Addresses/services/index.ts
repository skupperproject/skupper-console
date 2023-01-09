import { AddressResponse, FlowPairResponse } from 'API/REST.interfaces';

import { FlowPairBasic } from './services.interfaces';

export const AddressesController = {
    getAddressesWithFlowPairsCounts: (addresses: AddressResponse[]): AddressResponse[] =>
        addresses.map((address) => ({
            ...address,
            totalFlows: Math.floor(address.totalFlows / 2),
            currentFlows: Math.floor(address.currentFlows / 2),
        })),

    getFlowPairsByAddress: (flowsPairsByAddress: FlowPairResponse[]): FlowPairBasic[] => {
        const flowsPairsExtended = flowsPairsByAddress.map((flowPair) => {
            const {
                octetRate,
                octets,
                startTime,
                endTime,
                process: processId,
                processName,
                latency,
            } = flowPair.forwardFlow;

            const {
                octetRate: targetByteRate,
                octets: targetBytes,
                process: targetProcessId,
                processName: targetProcessName,
                latency: targetLatency,
            } = flowPair.counterFlow;

            return {
                id: flowPair.identity,
                siteId: flowPair.sourceSiteId,
                siteName: flowPair.sourceSiteName,
                byteRate: octetRate,
                bytes: octets,
                host: flowPair.forwardFlow.sourceHost,
                port: flowPair.forwardFlow.sourcePort,
                startTime,
                endTime,
                processId,
                processName,
                latency,

                targetSiteId: flowPair.destinationSiteId,
                targetSiteName: flowPair.destinationSiteName,
                targetByteRate,
                targetBytes,
                targetProcessId,
                targetProcessName,
                targetLatency,
            };
        });

        return flowsPairsExtended;
    },
};
