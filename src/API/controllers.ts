import { DataResponse, FlowsDataResponse } from './REST.interfaces';
import Adapter from './utils/adapter';
import { normalizeFlows, getFlowsTree } from './utils/utils';

export function getData(VANdata: DataResponse) {
    const data = JSON.parse(JSON.stringify(VANdata));

    return new Adapter(data).getData();
}

export function getSites(VANdata: DataResponse) {
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

export function getServices(VANdata: DataResponse) {
    return VANdata.services.map(({ address, protocol }) => ({
        id: address,
        name: address,
        protocol,
    }));
}

export function getDeployments(VANdata: DataResponse) {
    const data = JSON.parse(JSON.stringify(VANdata));
    const dataAdapted = new Adapter(data).getData();

    return dataAdapted.deployments;
}

export function getFlows(flowsData: FlowsDataResponse[], serviceAddress?: string) {
    if (serviceAddress) {
        return normalizeFlows(getFlowsTree(flowsData)).filter(
            (flow) => flow?.vanAddress === serviceAddress,
        );
    }

    return normalizeFlows(getFlowsTree(flowsData));
}

export function getFlowsNetworkStats(flowsData: FlowsDataResponse[]) {
    const data = flowsData;

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

        if (item.rtype === 'LINK' && !item.endTime && item.direction === 'outgoing') {
            acc.totalLinks = (acc.totalLinks || 0) + 1;
        }

        return acc;
    }, {} as Record<string, any>);

    return [
        {
            totalRouters: stats.totalRouters, // ignore the first route (hub)
            totalBytes: stats.totalBytes,
            totalFlows: stats.totalFlows,
            totalVanAddress: stats.totalVanAddress,
            totalLinks: stats.totalLinks, // the json data give us 2 endpoints for each link
        },
    ];
}

export function getFlowsRoutersStats(flowsData: FlowsDataResponse[]) {
    const data = flowsData;
    let current: string;
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
        } else if (item.rtype === 'LINK' && !item.endTime && item.direction === 'outgoing') {
            (acc[current].connectedTo = acc[current].connectedTo || []).push(item);
        } else if (item.octets) {
            acc[current].totalFlows++;
            acc[current].totalBytes += item.octets;
        } else if (item.vanAddress) {
            acc[current].totalVanAddress++;
        }

        return acc;
    }, {} as Record<string, any>);

    return Object.values(routersStats).filter((item) => item.totalVanAddress > 0);
}

export function getFlowsServiceStats(flowsData: FlowsDataResponse[]) {
    const data = flowsData;

    let current: string;
    let currentRouterName: string;
    const connections: Record<string, string> = {};
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
    }, {} as Record<string, any>);

    return Object.values(routersStats);
}

export function getFlowsConnectionsByService(
    flowsData: FlowsDataResponse[],
    serviceAddress: string,
) {
    const data = flowsData;

    const flows = normalizeFlows(getFlowsTree(data)).filter(
        (flow) => flow?.vanAddress === serviceAddress && flow.rtype === 'CONNECTOR',
    );

    return flows.flatMap((item) => {
        const group: Record<string, any> = {};
        item?.flows?.forEach(({ deviceNameConnectedTo, ...rest }: any) => {
            (group[deviceNameConnectedTo] = group[deviceNameConnectedTo] || []).push(rest);
        });

        return Object.entries(group).map(([k, v]) => ({
            ...item,
            deviceNameConnectedTo: k,
            flows: v,
        }));
    });
}

export function getFlowsTopology(flowsData: FlowsDataResponse[]) {
    const routerNodes = flowsData.filter((data) => data.rtype === 'ROUTER');
    const routersMap = routerNodes.reduce((acc, router) => {
        acc[router.name] = router;

        return acc;
    }, {} as Record<string, FlowsDataResponse>);

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
    }, [] as any[]);

    return { links: linkRouters, nodes: routerNodes };
}
