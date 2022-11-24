import { RESTApi } from 'API/REST';
import { AddressResponse } from 'API/REST.interfaces';

import { FlowPairBasic, ProcessRow } from './services.interfaces';

export const AddressesController = {
    getAddresses: async (): Promise<AddressResponse[]> => {
        const addresses = await RESTApi.fetchAddresses();

        return addresses.map((address) => ({
            ...address,
            totalFlows: Math.floor(address.totalFlows / 2),
            currentFlows: Math.floor(address.currentFlows / 2),
        }));
    },

    // TODO: waiting for the API to remove multiple calls and filters
    getFlowPairsByAddress: async (id: string): Promise<FlowPairBasic[]> => {
        const flowsPairs = await RESTApi.fetchFlowPairsByAddress(id);
        const sites = await RESTApi.fetchSites();

        const sitesMap = sites.reduce((acc, site) => {
            acc[site.identity] = site.name;

            return acc;
        }, {} as Record<string, string>);

        const flowsPairsExtended = await Promise.all(
            flowsPairs.map((flowPair) => {
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
            }),
        );

        return flowsPairsExtended;
    },
    getProcessesWithMetricsByAddress: async (id: string): Promise<ProcessRow[]> => {
        const processes = await RESTApi.fetchServerProcessesByAddresses(id);

        return Promise.all(
            processes.map(async (process) => {
                const site = await RESTApi.fetchSite(process.parent);
                const { destPort } = await RESTApi.fetchConnectorByProcess(process.identity);

                return {
                    identity: process.identity,
                    siteId: site.identity,
                    siteName: site.name,
                    processName: process.name,
                    host: process.sourceHost,
                    port: destPort,
                    imageName: process.imageName,
                    groupId: process.groupIdentity,
                    groupName: process.groupName,
                    bytes: process.octetsSent,
                    byteRate: process.octetSentRate,
                };
            }),
        );
    },
};
