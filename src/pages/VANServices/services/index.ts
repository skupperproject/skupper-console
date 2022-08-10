import { RESTApi } from 'API/REST';
import { FlowsDeviceResponse, FlowsProcessResponse, FlowsSiteResponse } from 'API/REST.interfaces';

import {
    VanServicesTopology,
    VanAddresses,
    ExtendedFlowPair,
    FlowsPairsBasic,
    FlowPairBasic,
} from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => {
        const vanAddresses = await RESTApi.fetchVanAddresses();

        return vanAddresses.map((vanAddress) => ({
            ...vanAddress,
            totalFlows: Math.round(vanAddress.totalFlows / 2),
            currentFlows: Math.round(vanAddress.currentFlows / 2),
        }));
    },

    // TODO: waiting for the API to remove multiple calls and filters
    fetchFlowsPairsByVanAddressId: async (
        id: string,
        currentPage: number,
        visibleItems: number,
    ): Promise<FlowsPairsBasic> => {
        const flowsPairs = await RESTApi.fetchFlowsPairsByVanAddr(id);
        const processes = await RESTApi.fetchFlowsProcesses();
        const sites = await RESTApi.fetchFlowsSites();

        const processesMap = processes.reduce((acc, process) => {
            acc[process.identity] = process;

            return acc;
        }, {} as Record<string, FlowsProcessResponse>);

        const sitesMap = sites.reduce((acc, site) => {
            acc[site.identity] = site.name;

            return acc;
        }, {} as Record<string, string>);

        const flowsPairsExtended = await Promise.all(
            flowsPairs.map(async (flowPair) => {
                const { octetRate, octets, startTime, endTime, process, latency } =
                    flowPair.ForwardFlow;
                const siteName = sitesMap[flowPair.ForwardSiteId];
                const processName = processesMap[process].name;
                const processId = processesMap[process].identity;
                const processHost = processesMap[process].sourceHost;
                const processImageName = processesMap[process].imageName;

                const {
                    octetRate: targetByteRate,
                    octets: targetBytes,
                    process: targetProcess,
                    latency: targetLatency,
                } = flowPair.ReverseFlow;

                const targetSiteName = sitesMap[flowPair.ReverseSiteId];
                const targetProcessName = processesMap[targetProcess].name;
                const targetProcessId = processesMap[targetProcess].identity;
                const targetHost = processesMap[targetProcess].sourceHost;
                const targetProcessImageName = processesMap[targetProcess].imageName;

                const connector = await RESTApi.fetchFlowConnectorByProcessId(processId);
                const targetConnector = await RESTApi.fetchFlowConnectorByProcessId(
                    targetProcessId,
                );

                return {
                    id: flowPair.identity,
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

    fetchFlowPairByFlowId: async (id: string): Promise<ExtendedFlowPair> => {
        const flowPair = await RESTApi.fetchFlowPair(id);

        const { parent, process } = flowPair.ForwardFlow;

        const startProcess = await RESTApi.fetchFlowProcess(process);
        const startSite = await RESTApi.fetchFlowsSite(startProcess.parent);

        const startListener = await RESTApi.fetchFlowsListener(parent);
        const startConnector = await RESTApi.fetchFlowsConnector(parent);
        const startDevice = { ...startListener, ...startConnector } as FlowsDeviceResponse;

        const start = {
            ...flowPair.ForwardFlow,
            device: startDevice,
            site: startSite,
            processFlow: startProcess,
            parentType: startDevice.recType,
        };

        const endFlow = flowPair.ReverseFlow;

        const { parent: reverseParent, process: reverseProcess } = flowPair.ReverseFlow;

        const endProcess = await RESTApi.fetchFlowProcess(reverseProcess);
        const endSite = (await RESTApi.fetchFlowsSite(endProcess.parent)) as FlowsSiteResponse;

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
                latency: Math.max(acc[flowPair.processName]?.latency || 0, flowPair.latency),
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
                latency: Math.max(
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
