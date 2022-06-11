import { RESTApi } from 'API/REST';
import {
    FlowResponse,
    FlowsDeviceResponse,
    FlowsResponse,
    FlowsRouterResponse,
} from 'API/REST.interfaces';

import { Connection, MonitoringTopology, VanAddresses } from './services.interfaces';

export const MonitorServices = {
    fetchFlowsByVanId: async (id: string | undefined): Promise<FlowsResponse[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchConnectionsByVanAddr: async (id: string | undefined): Promise<Connection | null> => {
        if (!id) {
            null;
        }

        const connections = await RESTApi.fetchFlowsConnectionsByVanAddr(id as string);

        const activeDevices = connections.filter(
            ({ rtype, endTime }) => (rtype === 'LISTENER' || rtype === 'CONNECTOR') && !endTime,
        ) as FlowsDeviceResponse[];

        const ids = activeDevices.map(({ parent }) => parent);
        const records = await RESTApi.fetchFlowRecord(ids);
        const devices = mergeDevicesById(activeDevices, records);

        const flows = connections.filter(
            ({ rtype, endTime }) => rtype === 'FLOW' && !endTime,
        ) as FlowResponse[];

        return { devices, flows };
    },

    fetchMonitoringTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),

    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchFlowsVanAddresses(),
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
