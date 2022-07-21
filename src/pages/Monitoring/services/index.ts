import { RESTApi } from 'API/REST';
import {
    FlowResponse,
    FlowsDataResponse,
    FlowsDeviceResponse,
    FlowsResponse,
} from 'API/REST.interfaces';

import {
    Connection,
    MonitoringTopology,
    VanAddresses,
    MonitoringConnection,
    FlowExtended,
} from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchVanAddresses(),

    fetchFlowsTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),

    fetchFlowsByVanId: async (id: string): Promise<FlowsResponse[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchFlowsByVanAddress: async (id: string): Promise<FlowExtended[]> => {
        const connections = await RESTApi.fetchConnectionsByVanAddr(id as string);

        const flows = (connections || []).filter(({ rtype }) => rtype === 'FLOW') as FlowResponse[];

        const flowsAdaptersMap = flows.reduce((acc, { parent, id: idFlow }) => {
            (acc[parent] = acc[parent] || []).push(idFlow);

            return acc;
        }, {} as Record<string, string[]>);

        const adaptersIds = Object.keys(flowsAdaptersMap);
        const adapters = await RESTApi.fetchFlowRecord(adaptersIds);

        const flowsRoutersMap = adapters.reduce((acc, { parent, id: idFlow }) => {
            (acc[parent] = acc[parent] || []).push(idFlow);

            return acc;
        }, {} as Record<string, string[]>);

        const routersIds = Object.keys(flowsRoutersMap);
        const routers = await RESTApi.fetchFlowRecord(routersIds);

        const adaptersWithRoutersInfo = mergeDevicesById(adapters, routers);
        const flowsWithAdaptersInfo = mergeDevicesById(flows, adaptersWithRoutersInfo);

        const counterFlows = flowsWithAdaptersInfo
            .map(({ counterflow }) => counterflow)
            .filter(Boolean);
        const endFlows = await RESTApi.fetchFlowRecord(counterFlows);

        const flowsAdaptersTargetsMap = endFlows.reduce((acc, { parent, id: idFlow }) => {
            (acc[parent] = acc[parent] || []).push(idFlow);

            return acc;
        }, {} as Record<string, string[]>);

        const adaptersIdsTargets = Object.keys(flowsAdaptersTargetsMap);
        const adaptersTargets = await RESTApi.fetchFlowRecord(adaptersIdsTargets);

        const flowsRoutersTargetsMap = adaptersTargets.reduce((acc, { parent, id: idFlow }) => {
            (acc[parent] = acc[parent] || []).push(idFlow);

            return acc;
        }, {} as Record<string, string[]>);

        const routersIdsTargets = Object.keys(flowsRoutersTargetsMap);
        const routersTargets = await RESTApi.fetchFlowRecord(routersIdsTargets);

        const adaptersWithRoutersInfoTargets = mergeDevicesById(adaptersTargets, routersTargets);
        const flowsWithAdaptersInfoTargets = mergeDevicesById(
            endFlows,
            adaptersWithRoutersInfoTargets,
        );

        const endFlowsMap = flowsWithAdaptersInfoTargets.reduce((acc, flow) => {
            if (flow.counterflow) {
                acc[flow.counterflow] = flow;
            }

            return acc;
        }, {} as Record<string, FlowsDataResponse>);

        const flowsWithCounterFlows = flowsWithAdaptersInfo.map((flow) => ({
            ...flow,
            target: endFlowsMap[flow.id],
        }));

        return flowsWithCounterFlows;
    },

    fetchConnectionsByVanAddr: async (id: string): Promise<Connection> => {
        const connections = await RESTApi.fetchConnectionsByVanAddr(id as string);

        const flows = (connections || []).filter(
            ({ rtype, endTime }) => rtype === 'FLOW' && !endTime,
        ) as FlowResponse[];

        const activeDevices = (connections || []).filter(
            ({ rtype, endTime }) => (rtype === 'LISTENER' || rtype === 'CONNECTOR') && !endTime,
        ) as FlowsDeviceResponse[];

        const routerIds = activeDevices.map(({ parent }) => parent);
        const routersInfo = await RESTApi.fetchFlowRecord(routerIds);
        const devices = mergeDevicesById(activeDevices, routersInfo);

        return { devices, flows };
    },

    fetchConnectionByFlowId: async (id: string): Promise<MonitoringConnection> => {
        const startFlows = await RESTApi.fetchFlowRecord([id]);
        const { counterflow, parent } = startFlows[0];

        const startFlowsDevice = await RESTApi.fetchFlowRecord([parent]);

        if (counterflow) {
            const endFlows = await RESTApi.fetchFlowRecord([counterflow]);

            return {
                startFlow: { ...startFlows[0], parentType: startFlowsDevice[0].rtype },
                endFlow: endFlows && endFlows[0],
            };
        }

        return {
            startFlow: { ...startFlows[0], parentType: startFlowsDevice[0].rtype } && startFlows[0],
            endFlow: undefined,
        };
    },
};

const mergeDevicesById = (a1: any[], a2: any[]) => {
    const a2Map = a2.reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
    }, {} as Record<string, any>);

    return a1.flatMap((item) => {
        const { name, namespace, rtype, protocol, parent } = a2Map[item.parent];

        return {
            ...item,
            name,
            protocol: protocol || item.protocol,
            routerName: item.name || name,
            namespace,
            parent: item.parent,
            parentRouter: parent || item.parent,
            device: rtype,
        };
    });
};
