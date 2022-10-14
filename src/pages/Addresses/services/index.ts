import { RESTApi } from 'API/REST';
import { AddressesResponse, ProcessResponse } from 'API/REST.interfaces';

import { FlowsPairsBasic, ProcessRow } from './services.interfaces';

export const AddressesController = {
    getAddresses: async (): Promise<AddressesResponse[]> => {
        const addresses = await RESTApi.fetchAddresses();

        return addresses.map((address) => ({
            ...address,
            totalFlows: Math.floor(address.totalFlows / 2),
            currentFlows: Math.floor(address.currentFlows / 2),
        }));
    },

    // TODO: waiting for the API to remove multiple calls and filters
    getFlowPairsByAddress: async (
        id: string,
        currentPage: number,
        visibleItems: number,
    ): Promise<FlowsPairsBasic> => {
        const flowsPairs = await RESTApi.fetchFlowPairsByAddress(id);
        const processes = await RESTApi.fetchProcesses();
        const sites = await RESTApi.fetchSites();

        const processesMap = processes.reduce((acc, process) => {
            acc[process.identity] = process;

            return acc;
        }, {} as Record<string, ProcessResponse>);

        const sitesMap = sites.reduce((acc, site) => {
            acc[site.identity] = site.name;

            return acc;
        }, {} as Record<string, string>);

        const flowsPairsExtended = await Promise.all(
            flowsPairs.map(async (flowPair) => {
                const { octetRate, octets, startTime, endTime, process, latency } =
                    flowPair.forwardFlow;
                const siteName = sitesMap[flowPair.sourceSiteId];
                const processName = processesMap[process].name;
                const processId = processesMap[process].identity;
                const processImageName = processesMap[process].imageName;

                const {
                    octetRate: targetByteRate,
                    octets: targetBytes,
                    process: targetProcess,
                    latency: targetLatency,
                } = flowPair.counterFlow;

                const targetSiteName = sitesMap[flowPair.destinationSiteId];
                const targetProcessName = processesMap[targetProcess].name;
                const targetProcessId = processesMap[targetProcess].identity;
                const targetHost = processesMap[targetProcess].sourceHost;
                const targetProcessImageName = processesMap[targetProcess].imageName;

                const connector = await RESTApi.fetchListener(flowPair.forwardFlow.parent);
                const targetConnector = await RESTApi.fetchConnectorByProcess(targetProcessId);

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
                    processImageName,
                    latency,

                    targetSiteId: flowPair.destinationSiteId,
                    targetSiteName,
                    targetByteRate,
                    targetBytes,
                    targetHost,
                    targetProcessId,
                    targetProcessName,
                    targetProcessImageName,
                    targetPort: targetConnector.destPort,
                    targetLatency,
                    protocol: connector.protocol,
                };
            }),
        );

        // filter collection
        const flowsFiltered = flowsPairsExtended.sort((a, b) => b.startTime - a.startTime);

        const startOffset = (currentPage - 1) * visibleItems;
        //paginate collection
        const flowsPairsPaginated = flowsFiltered.filter(
            (_, index) => index >= startOffset && index < startOffset + visibleItems,
        );

        return { connections: flowsPairsPaginated, total: flowsFiltered.length };
    },

    getProcessesWithMetricsByAddress: async (id: string): Promise<ProcessRow[]> => {
        const processes = await RESTApi.fetchProcessesByAddresses(id);

        return Promise.all(
            processes.map(async (process) => {
                const site = await RESTApi.fetchSite(process.parent);
                const { destPort } = await RESTApi.fetchConnectorByProcess(process.identity);

                return {
                    id: process.identity,
                    siteId: site.identity,
                    siteName: site.name,
                    processName: process.name,
                    host: process.sourceHost,
                    port: destPort,
                    imageName: process.imageName,
                    bytes: process.octetsSent,
                    byteRate: process.octetSentRate,
                };
            }),
        );
    },
};
