import { RESTApi } from 'API/REST';
import {
    FlowResponse,
    FlowsDeviceResponse,
    FlowsResponse,
    FlowsRouterResponse,
} from 'API/REST.interfaces';

import {
    Connection,
    MonitoringTopology,
    VanAddresses,
    MonitoringConnection,
} from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchFlowsVanAddresses(),

    fetchFlowsTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),

    fetchFlowsByVanId: async (id: string): Promise<FlowsResponse[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

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

const mergeDevicesById = (a1: FlowsDeviceResponse[], a2: FlowsRouterResponse[]) => {
    const a2Map = a2.reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
    }, {} as Record<string, FlowsRouterResponse>);

    return a1.flatMap((item) => {
        const { name, namespace } = a2Map[item.parent];

        return { ...item, routerName: name, namespace };
    });
};
