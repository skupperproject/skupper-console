import { FlowsDataResponse } from 'API/REST.interfaces';

type FlowsWithListenersConnectorsMapped =
    | FlowsDataResponse
    | (FlowsDataResponse & {
          connectedTo: FlowsDataResponse;
          deviceNameConnectedTo?: string | undefined;
      });

type ListToTree = FlowsWithListenersConnectorsMapped & {
    childNodes: FlowsWithListenersConnectorsMapped[];
};

type ListToTreeNormalized = FlowsWithListenersConnectorsMapped & {
    hostname: string;
    siteName: string;
    flows: FlowsWithListenersConnectorsMapped[];
};

function list_to_tree(dataset: FlowsWithListenersConnectorsMapped[]) {
    const hashTable = Object.create(null);
    const dataTree: ListToTree[] = [];

    dataset.forEach((data) => {
        hashTable[data.identity] = { ...data, childNodes: [] };
    });

    dataset.forEach((data) => {
        data.parent
            ? hashTable[data.parent].childNodes.push(hashTable[data.identity])
            : dataTree.push(hashTable[data.identity]);
    });

    return dataTree;
}

export function normalizeFlows(data: ListToTree[]) {
    return data
        .flatMap(({ childNodes, hostname, name }) => {
            if (childNodes.length) {
                return childNodes.flatMap((node) => {
                    const { childNodes: flows, ...rest } = node as ListToTree;

                    return {
                        ...rest,
                        hostname,
                        siteName: name,
                        flows,
                    };
                });
            }

            return undefined;
        })
        .filter(Boolean) as ListToTreeNormalized[];
}

function mapFlowsWithListenersConnectors(flows: FlowsDataResponse[]) {
    return flows.map((data) => {
        const listenersBound = flows.reduce((acc, item) => {
            if (item.counterFlow) {
                acc[item.identity] = item;
            }

            return acc;
        }, {} as Record<string, FlowsDataResponse>);

        const connectorsBound = flows.reduce((acc, item) => {
            if (item.counterFlow) {
                acc[item.counterFlow] = item;
            }

            return acc;
        }, {} as Record<string, FlowsDataResponse>);

        if (data.counterFlow) {
            const deviceConnectedTo = flows.find(
                (flow) =>
                    flow.identity === data.counterFlow && listenersBound[data.counterFlow]?.parent,
            );

            return {
                ...data,
                connectedTo: listenersBound[data.counterFlow],
                deviceNameConnectedTo: deviceConnectedTo?.name,
            };
        }

        if (data.recType === 'FLOW' && !data.counterFlow) {
            return { ...data, connectedTo: connectorsBound[data.identity] };
        }

        return data;
    });
}

export function getFlowsTree(data: FlowsDataResponse[]) {
    return list_to_tree(mapFlowsWithListenersConnectors(data));
}
