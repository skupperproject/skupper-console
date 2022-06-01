import { RESTApi } from 'API/REST';
import { FlowResponse, FlowsDeviceResponse, FlowsResponse } from 'API/REST.interfaces';

import { Connection, MonitoringTopology, VanAddresses } from './services.interfaces';

export const MonitorServices = {
    fetchFlowsByVanId: async (id: string | undefined): Promise<FlowsResponse[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchConnectionsByVanAddr: async (id: string | undefined): Promise<Connection | null> => {
        if (!id) {
            null;
        }

        const connections = await RESTApi.fetchFlowsConnectionsByVanAddr(id as string);
        const connectors = connections.filter(
            ({ rtype, endTime }) => rtype === 'CONNECTOR' && !endTime,
        ) as FlowsDeviceResponse[];
        const idsConn = connectors.map(({ parent }) => parent);
        const routersConnections = await RESTApi.fetchFlowRecord(idsConn);
        const recordsConnectors = mergeById(connectors, routersConnections);

        const listeners = connections.filter(
            ({ rtype, endTime }) => rtype === 'LISTENER' && !endTime,
        ) as FlowsDeviceResponse[] & {
            routerName: string;
        };
        const ids = listeners.map(({ parent }) => parent);
        const routersListeners = await RESTApi.fetchFlowRecord(ids);

        const recordsListeners = mergeById(listeners, routersListeners);

        const flows = connections.filter(
            ({ rtype, endTime }) => rtype === 'FLOW' && !endTime,
        ) as FlowResponse[];

        return { listeners: recordsListeners, connectors: recordsConnectors, flows };
    },

    fetchMonitoringTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),

    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchFlowsVanAddresses(),
};

const mergeById = (a1: FlowsDeviceResponse[], a2: FlowsDeviceResponse[]) => {
    const a2Map = a2.reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
    }, {} as Record<string, any>);

    return a1.flatMap((item) => {
        const { name, namespace } = a2Map[item.parent];

        return { ...item, routerName: name, namespace };
    });
};
