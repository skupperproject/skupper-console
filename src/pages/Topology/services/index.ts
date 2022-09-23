import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { RESTApi } from 'API/REST';
import { DeploymentLinkTopology, ProcessResponse, SiteDataResponse } from 'API/REST.interfaces';

import { TopologyNode } from '../Topology.interfaces';
import { Deployments, ProcessesMetrics, SitesMetrics } from './services.interfaces';

export const TopologyController = {
    getDeployments: async (): Promise<Deployments> => {
        const processes = await RESTApi.fetchProcesses();
        const links = await RESTApi.fetchFlowAggregatesProcesses();

        const deploymentLinks = links.map(({ identity, sourceId, destinationId }) => ({
            key: identity,
            source: sourceId,
            target: destinationId,
        }));

        return { deployments: processes, deploymentLinks };
    },

    getSiteMetrics: async (id: string): Promise<SitesMetrics> => {
        const site = await RESTApi.fetchSite(id);
        const flowAggregatesPairs = await RESTApi.fetchFlowAggregatesSites();

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesSite(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesSite(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        return {
            ...site,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getProcessMetrics: async (id: string): Promise<ProcessesMetrics> => {
        const process = await RESTApi.fetchProcess(id);
        const flowAggregatesPairs = await RESTApi.fetchFlowAggregatesProcesses();

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesProcess(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesProcess(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        return {
            ...process,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getNodesSites: (sites: SiteDataResponse[]) =>
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

    getLinkSites: (sites: SiteDataResponse[]) =>
        sites?.flatMap(({ siteId: sourceId, connected }) =>
            connected.flatMap((targetId) => [
                {
                    source: sourceId,
                    target: targetId,
                    type: 'linkSite',
                },
            ]),
        ),

    getServiceNodes: (deployments: ProcessResponse[], siteNodes: TopologyNode[]) =>
        deployments
            ?.map((node) => {
                const positions = localStorage.getItem(node.identity);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                const site = siteNodes?.find(({ id }) => id === node.parent);
                const groupIndex = site?.group || 0;

                return {
                    id: node.identity,
                    name: node.name,
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

    getLinkServices: (deploymentsLinks: DeploymentLinkTopology[]) =>
        deploymentsLinks?.flatMap(({ source, target }) => ({
            source,
            target,
            type: 'linkService',
        })),
};

const color = scaleOrdinal(schemeCategory10);
