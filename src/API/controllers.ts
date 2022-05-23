import { DataResponse, FlowsDataResponse } from './REST.interfaces';
import Adapter from './utils/adapter';
import { normalizeFlows, getFlowsTree } from './utils/utils';

export function getData(VANdata: DataResponse) {
    const data = JSON.parse(JSON.stringify(VANdata));

    return new Adapter(data).getData();
}

export function getSites(VANdata: DataResponse) {
    const { sites } = VANdata;

    return sites.map(({ site_id, site_name, version, url, connected, gateway, namespace }) => ({
        siteId: site_id,
        siteName: site_name,
        version,
        url,
        connected,
        namespace,
        numSitesConnected: connected.length,
        gateway,
    }));
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
            target: target?.id,
            mode: link.mode,
            cost: link.linkCost,
        });

        return acc;
    }, [] as any[]);

    return { links: linkRouters, nodes: routerNodes };
}
