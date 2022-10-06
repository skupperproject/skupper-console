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

        if (!flowsPairs) {
            return {
                connections: [],
                total: 0,
            };
        }

        const processes = await RESTApi.fetchProcesses();
        const sites = await RESTApi.fetchFlowsSites();

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
                const processHost = processesMap[process].sourceHost;
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

                const connector = await RESTApi.fetchFlowsListener(flowPair.forwardFlow.parent);
                const targetConnector = await RESTApi.fetchFlowConnectorByProcessId(
                    targetProcessId,
                );

                return {
                    id: flowPair.identity,
                    siteId: flowPair.sourceSiteId,
                    siteName,
                    byteRate: octetRate,
                    bytes: octets,
                    host: processHost,
                    port: connector.destPort,
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
        ).catch((error) => Promise.reject(error));

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
                const site = await RESTApi.fetchFlowsSite(process.parent);
                const { destPort } = await RESTApi.fetchFlowConnectorByProcessId(process.identity);
                const flows = await RESTApi.fetchFlowsByProcessesId(process.identity);

                const flowsMetrics = flows
                    .filter(({ endTime }) => !endTime)
                    .reduce(
                        (acc, { octetRate, octets, latency }) => ({
                            bytes: (acc?.bytes || 0) + octets,
                            byteRate: (acc?.byteRate || 0) + octetRate,
                            maxTTFB: Math.max(acc.maxTTFB || 0, latency),
                        }),
                        {} as { bytes: number; byteRate: number; maxTTFB: number },
                    );

                return {
                    id: process.identity,
                    siteId: site.identity,
                    siteName: site.name,
                    processName: process.name,
                    host: process.sourceHost,
                    port: destPort,
                    imageName: process.imageName,
                    ...flowsMetrics,
                };
            }),
        ).catch((error) => Promise.reject({ message: error }));
    },
};
