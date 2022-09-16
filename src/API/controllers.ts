import {
    DataResponse,
    FlowsDataResponse,
    RouterResponse,
    FlowsTopologyLink,
    LinkResponse,
} from './REST.interfaces';

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

export function getFlowsTopology(routers: RouterResponse[], links: LinkResponse[]) {
    const routersMap = routers.reduce((acc, router) => {
        //TODO: improve the logic to associate link source and link target
        const name = router.name.split('/')[1];
        acc[name] = router;

        return acc;
    }, {} as Record<string, RouterResponse>);

    const linksWithRouters = links
        .filter(({ linkCost, direction }) => linkCost && direction === 'incoming')
        .reduce((acc, link) => {
            const target = routersMap[link.name];

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
