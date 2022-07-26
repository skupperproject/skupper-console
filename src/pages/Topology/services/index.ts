import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { DeploymentLink, Site } from '@pages/Sites/services/services.interfaces';
import { RESTApi } from 'API/REST';

import { TopologyNode } from '../components/TopologySVG.interfaces';
import { DeploymentNode, Deployments } from './services.interfaces';

export const TopologyServices = {
    fetchDeployments: async (): Promise<Deployments> => {
        const { deployments, deploymentLinks } = await RESTApi.fetchData();

        return { deployments, deploymentLinks };
    },

    getNodesSites: (sites: Site[]) =>
        sites
            ?.sort((a, b) => a.siteId.localeCompare(b.siteId))
            .map((node, index) => {
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
                    groupName: node.siteName,
                    group: index,
                    color: color(index.toString()),
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
        deployments
            ?.map((node) => {
                const positions = localStorage.getItem(node.key);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                const site = siteNodes?.find(({ id }) => id === node.site.site_id);
                const groupIndex = site?.group || 0;

                return {
                    id: node.key,
                    name: node.service.address,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    type: 'service',
                    groupName: site?.name || '',
                    group: groupIndex,
                    color: color(groupIndex.toString()),
                };
            })
            .sort((a, b) => a.group - b.group),

    getLinkServices: (deploymentsLinks: DeploymentLink[]) =>
        deploymentsLinks?.flatMap(({ source, target }) => ({
            source: source.key,
            target: target.key,
            type: 'linkService',
        })),
};

const color = scaleOrdinal(schemeCategory10);
