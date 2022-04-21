import { createServer, Response } from 'miragejs';

const DELAY_RESPONSE = 1000;

export function loadMockServerInDev() {
    if (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER) {
        const path = './data';
        const VANdata = require(`${path}/DATA.json`);
        const flowsData = require(`${path}/FLOWS.json`);
        const services = require(`${path}/SERVICES.json`);

        createServer({
            routes() {
                this.timing = DELAY_RESPONSE;

                // General APIs
                this.get('/error', () => {
                    return new Response(500, { some: 'header' }, { errors: ['Server Error'] });
                });

                // Sites APIs
                this.get('/data', () => {
                    return VANdata;
                });

                this.get('/sites/services', () => {
                    return services;
                });

                // Services APIs
                this.get('/services', () => {
                    return VANdata.services.map(({ address, protocol }) => {
                        return { id: address, name: address, protocol };
                    });
                });

                // Deployments APIs
                this.get('/deployments', () => {
                    const sitesMap = VANdata.sites.reduce((acc, site) => {
                        acc[site.site_id] = { name: site.site_name, url: site.url };
                        return acc;
                    }, {});

                    const deployments = VANdata.services.map(
                        ({
                            targets,
                            address,
                            protocol,
                            connections_ingress,
                            connections_egress,
                        }) => {
                            const sitesConnected = targets
                                .map((target) => sitesMap[target.site_id])
                                .filter(Boolean);
                            return {
                                id: address,
                                name: address,
                                protocol: protocol,
                                numConnectionsIn: connections_ingress.length,
                                numConnectionsOut: connections_egress.length,
                                sites: sitesConnected,
                            };
                        },
                    );

                    return deployments;
                });

                // Flows APIs
                this.get('/flows', (_, { queryParams }) => {
                    if (queryParams.vanaddr) {
                        return normalizeFlows(getFlowsTree(flowsData)).filter(
                            (flow) => flow.vanAddress === queryParams.vanaddr,
                        );
                    }

                    return normalizeFlows(getFlowsTree(generateDynamicBytes(flowsData)));
                });

                this.get('/flows/network-stats', () => {
                    let data = generateDynamicBytes(flowsData);

                    const stats = data.reduce((acc, item) => {
                        if (item.vanAddress && !acc[item.vanAddress]) {
                            acc[item.vanAddress] = true;
                            acc['totalVanAddress'] = (acc['totalVanAddress'] || 0) + 1;
                        }
                        if (item.octets && acc[item.counterflow] !== item.id) {
                            acc[item.id] = item.counterflow;
                            acc['totalFlows'] = (acc['totalFlows'] || 0) + 1;
                        }

                        if (item.octets) {
                            acc['totalBytes'] = (acc['totalFlows'] || 0) + item.octets;
                        }

                        if (item.rtype === 'ROUTER') {
                            acc['totalRouters'] = (acc['totalRouters'] || 0) + 1;
                        }

                        if (item.rtype === 'LINK') {
                            acc['totalLinks'] = (acc['totalLinks'] || 0) + 1;
                        }
                        return acc;
                    }, {});

                    return [
                        {
                            totalRouters: stats.totalRouters - 1, // ignore the first route (hub)
                            totalBytes: stats.totalBytes,
                            totalFlows: stats.totalFlows,
                            totalVanAddress: stats.totalVanAddress,
                            totalLinks: stats.totalLinks / 2, // the json data give us 2 endpoints for each link
                        },
                    ];
                });

                this.get('/flows/routers-stats', () => {
                    let data = generateDynamicBytes(flowsData);
                    let current;
                    const routersStats = data.reduce((acc, item) => {
                        if (item.rtype === 'ROUTER') {
                            current = item.id;
                            acc[current] = {
                                id: item.id,
                                name: item.name,
                                totalBytes: 0,
                                totalFlows: 0,
                                totalVanAddress: 0,
                            };
                        } else if (item.rtype === 'LINK') {
                            (acc[current]['connectedTo'] = acc[current]['connectedTo'] || []).push(
                                item,
                            );
                        } else if (item.octets) {
                            acc[current].totalFlows++;
                            acc[current].totalBytes += item.octets;
                        } else if (item.vanAddress) {
                            acc[current].totalVanAddress++;
                        }
                        return acc;
                    }, {});

                    return Object.values(routersStats).filter((item) => item.totalVanAddress > 0);
                });

                this.get('/flows/services-stats', () => {
                    let data = generateDynamicBytes(flowsData);

                    let current;
                    let currentRouterName;
                    let connections = {};
                    const routersStats = data.reduce((acc, item) => {
                        if (item.rtype === 'ROUTER') {
                            currentRouterName = item.name;
                        }

                        if (item.vanAddress) {
                            current = item.vanAddress;
                            const routersAssociated = acc[current]
                                ? `${acc[current].routersAssociated} - ${currentRouterName}`
                                : currentRouterName;

                            acc[current] = {
                                id: item.id,
                                name: current,
                                totalBytes: 0,
                                totalFlows: (acc[current] && acc[current].totalFlows) || 0,
                                totalDevices:
                                    ((acc[current] && acc[current].totalDevices) || 0) + 1,
                                routersAssociated,
                            };
                        } else if (
                            acc[current] &&
                            item.octets &&
                            connections[item.counterflow] !== item.id
                        ) {
                            connections[item.id] = item.counterflow;
                            acc[current].totalFlows = (acc[current].totalFlows || 0) + 1;
                        } else if (acc[current] && item.octets) {
                            acc[current].totalBytes += item.octets;
                        }

                        return acc;
                    }, {});

                    return Object.values(routersStats);
                });

                this.get('/flows/connections', (_, { queryParams }) => {
                    let data = generateDynamicBytes(flowsData);

                    const flows = normalizeFlows(getFlowsTree(data)).filter(
                        (flow) =>
                            flow.vanAddress === queryParams.vanaddr && flow.rtype === 'CONNECTOR',
                    );

                    return flows.flatMap((item) => {
                        let group = {};
                        item.flows?.forEach(({ deviceNameConnectedTo, ...rest }) => {
                            (group[deviceNameConnectedTo] =
                                group[deviceNameConnectedTo] || []).push(rest);
                        });
                        return Object.entries(group).map(([k, v]) => ({
                            ...item,
                            deviceNameConnectedTo: k,
                            flows: v,
                        }));
                    });
                });

                this.get('/flows/topology/network', () => {
                    const routerNodes = flowsData.filter((data) => data.rtype === 'ROUTER');
                    const routersMap = routerNodes.reduce((acc, router) => {
                        acc[router.name] = router;

                        return acc;
                    }, {});

                    const links = flowsData.filter((data) => data.rtype === 'LINK');
                    const linkRouters = links.reduce((acc, link) => {
                        const target = routersMap[link.name];

                        acc.push({
                            source: link.parent,
                            target: target.id,
                            mode: link.mode,
                            cost: link.linkCost,
                        });

                        return acc;
                    }, []);

                    return { links: linkRouters, nodes: routerNodes };
                });
            },
        });
    }
}

/******************
 * UTILS
 *****************/

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

function normalizeFlows(data) {
    console.log(data);
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
        const listenersBound = flows.reduce((acc, item) => {
            return {
                ...acc,
                [item.id]: item,
            };
        }, {});

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

function getFlowsTree(data) {
    return list_to_tree(mapFlowsWithListenersConnectors(data));
}

// TODO: simulate dynamic bytes flow
function generateDynamicBytes(flows) {
    return flows.map((item) => {
        return item.rtype === 'FLOW'
            ? { ...item, octets: item.octets + Math.random() * (1024 * 1024 * 10) }
            : item;
    });
}
