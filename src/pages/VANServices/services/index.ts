import { RESTApi } from 'API/REST';
import { FlowsDeviceResponse, ProcessResponse, SiteResponse } from 'API/REST.interfaces';

import {
    VanServicesTopology,
    VanAddresses,
    ExtendedFlowPair,
    FlowsPairsBasic,
    FlowPairBasic,
    ProcessRow,
} from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => {
        const vanAddresses = await RESTApi.fetchVanAddresses();

        return vanAddresses.map((vanAddress) => ({
            ...vanAddress,
            totalFlows: Math.floor(vanAddress.totalFlows / 2),
            currentFlows: Math.floor(vanAddress.currentFlows / 2),
        }));
    },

    // TODO: waiting for the API to remove multiple calls and filters
    fetchFlowPairsByVanAddressId: async (
        id: string,
        currentPage: number,
        visibleItems: number,
    ): Promise<FlowsPairsBasic> => {
        const flowsPairs = await RESTApi.fetchFlowsPairsByVanAddr(id);

        if (!flowsPairs) {
            return {
                connections: [],
                total: 0,
            };
        }

        const processes = await RESTApi.fetchFlowsProcesses();
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
                } = flowPair.CounterFlow;

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

    fetchProcessesByVanAddr: async (id: string): Promise<ProcessRow[]> => {
        const processes = await RESTApi.fetchProcessesByVanAddr(id);

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
        );
    },

    fetchFlowPairByFlowId: async (id: string): Promise<ExtendedFlowPair> => {
        const flowPair = await RESTApi.fetchFlowPair(id);

        const { parent, process } = flowPair.forwardFlow;

        const startProcess = await RESTApi.fetchFlowProcess(process);
        const startSite = await RESTApi.fetchFlowsSite(startProcess.parent);

        const startListener = await RESTApi.fetchFlowsListener(parent);
        const startConnector = await RESTApi.fetchFlowsConnector(parent);
        const startDevice = { ...startListener, ...startConnector } as FlowsDeviceResponse;

        const start = {
            ...flowPair.forwardFlow,
            device: startDevice,
            site: startSite,
            processFlow: startProcess,
            parentType: startDevice.recType,
        };

        const endFlow = flowPair.CounterFlow;

        const { parent: reverseParent, process: reverseProcess } = flowPair.CounterFlow;

        const endProcess = await RESTApi.fetchFlowProcess(reverseProcess);
        const endSite = (await RESTApi.fetchFlowsSite(endProcess.parent)) as SiteResponse;

        const endListener = await RESTApi.fetchFlowsListener(reverseParent);
        const endConnector = await RESTApi.fetchFlowsConnector(reverseParent);

        const endFlowsDevice = { ...endListener, ...endConnector } as FlowsDeviceResponse;

        const end = {
            ...endFlow,
            device: endFlowsDevice,
            site: endSite,
            processFlow: endProcess,
            parentType: endFlowsDevice.recType,
        };

        return {
            startFlow: start,
            endFlow: end,
        };
    },

    fetchFlowPairTopology: async (): Promise<VanServicesTopology> => RESTApi.fetchFlowsTopology(),

    getProcessesViewData(flowPairs: FlowPairBasic[]) {
        const processesMap = flowPairs.reduce((acc, flowPair) => {
            acc[flowPair.processName] = {
                id: flowPair.processId,
                siteName: flowPair.siteName,
                processName: flowPair.processName,
                bytes: (acc[flowPair.processName]?.bytes || 0) + flowPair.bytes,
                byteRate: (acc[flowPair.processName]?.byteRate || 0) + flowPair.byteRate,
                host: flowPair.host,
                port: flowPair.port,
                minTTFB: Math.min(acc[flowPair.processName]?.latency || 0, flowPair.latency),
                maxTTFB: Math.max(acc[flowPair.processName]?.latency || 0, flowPair.latency),
                imageName: flowPair.processImageName,
                protocol: flowPair.protocol,
            };

            acc[flowPair.targetProcessName] = {
                id: flowPair.targetProcessId,
                siteName: flowPair.targetSiteName,
                processName: flowPair.targetProcessName,
                bytes: (acc[flowPair.targetProcessName]?.bytes || 0) + flowPair.targetBytes,
                byteRate:
                    (acc[flowPair.targetProcessName]?.byteRate || 0) + flowPair.targetByteRate,
                host: flowPair.targetHost,
                port: flowPair.targetPort,
                minTTFB: Math.min(
                    acc[flowPair.processName]?.targetLatency || 0,
                    flowPair.targetLatency,
                ),
                maxTTFB: Math.max(
                    acc[flowPair.processName]?.targetLatency || 0,
                    flowPair.targetLatency,
                ),
                imageName: flowPair.targetProcessImageName,
                protocol: flowPair.protocol,
            };

            return acc;
        }, {} as Record<string, any>);

        return Object.values(processesMap);
    },
};
