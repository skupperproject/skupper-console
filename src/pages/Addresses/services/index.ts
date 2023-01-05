import { AddressResponse, FlowPairResponse, SiteResponse } from 'API/REST.interfaces';

import { FlowPairBasic } from './services.interfaces';

export const AddressesController = {
    getAddressesWithFlowPairsCounts: (addresses: AddressResponse[]): AddressResponse[] =>
        addresses.map((address) => ({
            ...address,
            totalFlows: Math.floor(address.totalFlows / 2),
            currentFlows: Math.floor(address.currentFlows / 2),
        })),

    getFlowPairsByAddress: (
        flowsPairsByAddress: FlowPairResponse[],
        sites: SiteResponse[],
    ): FlowPairBasic[] => {
        const sitesMap = sites.reduce((acc, site) => {
            acc[site.identity] = site.name;

            return acc;
        }, {} as Record<string, string>);

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
            const siteName = sitesMap[flowPair.sourceSiteId];

            const {
                octetRate: targetByteRate,
                octets: targetBytes,
                process: targetProcessId,
                processName: targetProcessName,
                latency: targetLatency,
            } = flowPair.counterFlow;

            const targetSiteName = sitesMap[flowPair.destinationSiteId];

            return {
                id: flowPair.identity,
                siteId: flowPair.sourceSiteId,
                siteName,
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
                targetSiteName,
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
