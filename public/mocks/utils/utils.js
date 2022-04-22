function list_to_tree(dataset) {
    const hashTable = Object.create(null);
    const dataTree = [];

    dataset.forEach((data) => {
        hashTable[data.id] = { ...data, childNodes: [] };
    });

    dataset.forEach((data) => {
        data.parent
            ? hashTable[data.parent].childNodes.push(hashTable[data.id])
            : dataTree.push(hashTable[data.id]);
    });

    return dataTree;
}

export function normalizeFlows(data) {
    return data
        .flatMap(({ childNodes, hostname, name }) => {
            if (childNodes.length) {
                return childNodes.flatMap((node) => {
                    const { childNodes: flows, ...rest } = node;

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
        .filter(Boolean);
}

function mapFlowsWithListenersConnectors(flows) {
    return flows.map((data) => {
        const listenersBound = flows.reduce(
            (acc, item) => ({
                ...acc,
                [item.id]: item,
            }),
            {},
        );

        const connectorsBound = flows.reduce((acc, item) => {
            if (item.counterflow) {
                acc[item.counterflow] = item;
            }

            return acc;
        }, {});

        if (data.counterflow) {
            const deviceConnectedTo = flows.find(
                (flow) => flow.id === listenersBound[data.counterflow]?.parent,
            );

            return {
                ...data,
                connectedTo: listenersBound[data.counterflow],
                deviceNameConnectedTo: deviceConnectedTo.name,
            };
        }

        if (data.rtype === 'FLOW' && !data.counterflow) {
            return { ...data, connectedTo: connectorsBound[data.id] };
        }

        return data;
    });
}

export function getFlowsTree(data) {
    return list_to_tree(mapFlowsWithListenersConnectors(data));
}

// TODO: simulate dynamic bytes flow
export function generateDynamicBytes(flows) {
    return flows.map((item) =>
        item.rtype === 'FLOW'
            ? { ...item, octets: item.octets + Math.random() * (1024 * 1024 * 10) }
            : item,
    );
}
