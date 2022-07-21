import {
    DataResponse,
    FlowsDataResponse,
    FlowsLinkResponse,
    FlowsRouterResponse,
    FlowsTopologyLink,
} from './REST.interfaces';
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

export function getFlowsConnectionsByService(flowsData: FlowsDataResponse[]) {
    const data = flowsData;

    const flows = normalizeFlows(getFlowsTree(data));

    return flows.flatMap((item) => {
        const group: Record<string, any> = {};
        item?.flows?.forEach(({ name, ...rest }: any) => {
            (group[name] = group[name] || []).push(rest);
        });

        return Object.values(group).map((v) => ({
            ...item,
            flows: v,
        }));
    });
}

export function getFlowsTopology(routers: FlowsRouterResponse[], links: FlowsLinkResponse[]) {
    const routersMap = routers.reduce((acc, router) => {
        acc[router.identity] = router;

        return acc;
    }, {} as Record<string, FlowsRouterResponse>);

    const linksWithRouters = links
        .filter(({ linkCost, direction }) => linkCost && direction === 'incoming')
        .reduce((acc, link) => {
            const target = routersMap[link.parent];

            acc.push({
                source: link.parent,
                target: target?.identity,
                mode: link.mode,
                cost: link.linkCost,
            });

            return acc;
        }, [] as FlowsTopologyLink[]);

    return { links: linksWithRouters, nodes: routers as FlowsDataResponse[] };
}
