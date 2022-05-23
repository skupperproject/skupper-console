import { DeploymentLink, Site } from '@pages/Sites/services/services.interfaces';
import { RESTApi } from 'API/REST';

import { TopologyNode } from '../components/Topology.interfaces';
import { DeploymentNode, Deployments } from './services.interfaces';

export const TopologyServices = {
    fetchDeployments: async (): Promise<Deployments> => {
        const { deployments, deploymentLinks } = await RESTApi.fetchData();

        return { deployments, deploymentLinks };
    },

    getSiteNodes: (sites: Site[]) =>
        sites?.map((node) => {
            const positions = localStorage.getItem(node.siteId);
            const fx = positions ? JSON.parse(positions).fx : null;
            const fy = positions ? JSON.parse(positions).fy : null;

            return {
                id: node.siteId,
                name: node.siteName,
                x: fx || 0,
                y: fy || 0,
                fx,
                fy,
                type: 'site',
                group: sites?.findIndex(({ siteId }) => siteId === node.siteId) || 0,
            };
        }),

    getLinkSites: (sites: Site[]) =>
        sites?.flatMap(({ siteId: sourceId, connected }) =>
            connected.flatMap((targetId) => [
                {
                    source: sourceId,
                    target: targetId,
                    type: 'linkSite',
                },
            ]),
        ),

    getServiceNodes: (deployments: DeploymentNode[], siteNodes: TopologyNode[]) =>
        deployments?.map((node) => {
            const positions = localStorage.getItem(node.key);
            const fx = positions ? JSON.parse(positions).fx : null;
            const fy = positions ? JSON.parse(positions).fy : null;

            return {
                id: node.key,
                name: node.service.address,
                x: fx || 0,
                y: fy || 0,
                fx,
                fy,
                type: 'service',
                group: siteNodes?.findIndex(({ id }) => id === node.site.site_id) || 0,
            };
        }),

    getLinkServices: (deploymentsLinks: DeploymentLink[]) =>
        deploymentsLinks?.flatMap(({ source, target }) => ({
            source: source.key,
            target: target.key,
            type: 'linkService',
        })),
};
