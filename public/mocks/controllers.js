import { normalizeFlows, getFlowsTree, generateDynamicBytes } from './utils/utils';
import Adapter from './utils/adapter';

export function getData(VANdata) {
    const data = JSON.parse(JSON.stringify(VANdata));
    return new Adapter(data).getData();
}

export function getSites(VANdata) {
    const { sites } = VANdata;

    return sites.map(
        ({ site_id, site_name, edge, version, url, connected, gateway, namespace }) => ({
            siteId: site_id,
            siteName: site_name,
            edge,
            version,
            url,
            connected,
            namespace,
            numSitesConnected: connected.length,
            gateway,
        }),
    );
}

export function getServices(VANdata) {
    return VANdata.services.map(({ address, protocol }) => ({
        id: address,
        name: address,
        protocol,
    }));
}

export function getDeployments(VANdata) {
    const data = JSON.parse(JSON.stringify(VANdata));
    const dataAdapted = new Adapter(data).getData();

    return dataAdapted.deployments;

    // const sitesMap = VANdata.sites.reduce((acc, site) => {
    //     acc[site.site_id] = { name: site.site_name, url: site.url };

    //     return acc;
    // }, {});

    // const deployments = VANdata.services.map(
    //     ({ targets, address, protocol, connections_ingress, connections_egress }) => {
    //         const sitesConnected = targets
    //             .map((target) => sitesMap[target.site_id])
    //             .filter(Boolean);

    //         return {
    //             id: address,
    //             name: address,
    //             protocol,
    //             numConnectionsIn: connections_ingress && connections_ingress.length,
    //             numConnectionsOut: connections_egress && connections_egress.length,
    //             sites: sitesConnected,
    //         };
    //     },
    // );

    // return deployments;
}

export function getFlows(flowsData, serviceAddress) {
    if (serviceAddress) {
        return normalizeFlows(getFlowsTree(flowsData)).filter(
            (flow) => flow.vanAddress === serviceAddress,
        );
    }

    return normalizeFlows(getFlowsTree(generateDynamicBytes(flowsData)));
}

export function getFlowsNetworkStats(flowsData) {
    const data = generateDynamicBytes(flowsData);

    const stats = data.reduce((acc, item) => {
        if (item.vanAddress && !acc[item.vanAddress]) {
            acc[item.vanAddress] = true;
            acc.totalVanAddress = (acc.totalVanAddress || 0) + 1;
        }
        if (item.octets && acc[item.counterflow] !== item.id) {
            acc[item.id] = item.counterflow;
            acc.totalFlows = (acc.totalFlows || 0) + 1;
        }

        if (item.octets) {
            acc.totalBytes = (acc.totalFlows || 0) + item.octets;
        }

        if (item.rtype === 'ROUTER') {
            acc.totalRouters = (acc.totalRouters || 0) + 1;
        }

        if (item.rtype === 'LINK') {
            acc.totalLinks = (acc.totalLinks || 0) + 1;
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
}

export function getFlowsRoutersStats(flowsData) {
    const data = generateDynamicBytes(flowsData);
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
            (acc[current].connectedTo = acc[current].connectedTo || []).push(item);
        } else if (item.octets) {
            acc[current].totalFlows++;
            acc[current].totalBytes += item.octets;
        } else if (item.vanAddress) {
            acc[current].totalVanAddress++;
        }

        return acc;
    }, {});

    return Object.values(routersStats).filter((item) => item.totalVanAddress > 0);
}

export function getFlowsServiceStats(flowsData) {
    const data = generateDynamicBytes(flowsData);

    let current;
    let currentRouterName;
    const connections = {};
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
                totalDevices: ((acc[current] && acc[current].totalDevices) || 0) + 1,
                routersAssociated,
            };
        } else if (acc[current] && item.octets && connections[item.counterflow] !== item.id) {
            connections[item.id] = item.counterflow;
            acc[current].totalFlows = (acc[current].totalFlows || 0) + 1;
        } else if (acc[current] && item.octets) {
            acc[current].totalBytes += item.octets;
        }

        return acc;
    }, {});

    return Object.values(routersStats);
}

export function getFlowsConnectionsByService(flowsData, serviceAddress) {
    const data = generateDynamicBytes(flowsData);

    const flows = normalizeFlows(getFlowsTree(data)).filter(
        (flow) => flow.vanAddress === serviceAddress && flow.rtype === 'CONNECTOR',
    );

    return flows.flatMap((item) => {
        const group = {};
        item.flows?.forEach(({ deviceNameConnectedTo, ...rest }) => {
            (group[deviceNameConnectedTo] = group[deviceNameConnectedTo] || []).push(rest);
        });

        return Object.entries(group).map(([k, v]) => ({
            ...item,
            deviceNameConnectedTo: k,
            flows: v,
        }));
    });
}

export function getFlowsTopology(flowsData) {
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
}
