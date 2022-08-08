import { RESTApi } from 'API/REST';
import { FlowsDeviceResponse, FlowsSiteResponse } from 'API/REST.interfaces';

import {
    VanServicesTopology,
    VanAddresses,
    ExtendedFlowPair,
    FlowsPairsBasic,
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
        filters: { shouldShowActiveFlows?: boolean },
    ): Promise<FlowsPairsBasic> => {
        const flowsPairs = await RESTApi.fetchFlowsPairsByVanAddr(id);
        const processes = await RESTApi.fetchFlowsProcesses();
        const sites = await RESTApi.fetchFlowsSites();

        const processesMap = processes.reduce((acc, process) => {
            acc[process.identity] = process.name;

            return acc;
        }, {} as Record<string, string>);

        const sitesMap = sites.reduce((acc, site) => {
            acc[site.identity] = site.name;

            return acc;
        }, {} as Record<string, string>);

        const flowsPairsExtended = flowsPairs.map((flowPair) => {
            const processName = processesMap[flowPair.ForwardFlow.process];
            const targetProcessName = processesMap[flowPair.ReverseFlow.process];

            const siteName = sitesMap[flowPair.ForwardSiteId];
            const targetSiteName = sitesMap[flowPair.ReverseSiteId];

            return {
                ...flowPair.ForwardFlow,
                identity: flowPair.identity,
                processName,
                targetProcessName,
                siteName,
                targetSiteName,
            };
        });

        // filter collection
        const flowsFiltered = flowsPairsExtended
            .sort((a, b) => b.startTime - a.startTime)
            .filter((flow) => !(filters.shouldShowActiveFlows && flow.endTime));

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
};
