import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { SiteExtended } from '@pages/Sites/Sites.interfaces';
import { RESTApi } from 'API/REST';
import {
    DeploymentLinkTopology,
    ProcessGroupResponse,
    ProcessResponse,
    SiteResponse,
} from 'API/REST.interfaces';

import { colors } from '../Topology.constant';
import { TopologyEdges, TopologyNode } from '../Topology.interfaces';
import { ProcessesMetrics, ProcessGroupMetrics, SitesMetrics } from './services.interfaces';

export const TopologyController = {
    // Add to each site the prop connected that is a collection of bound site ids  using the command 'skupper link create'
    // This prop is used to show the edges in the topology sites
    getSitesWithLinksCreated: async (): Promise<SiteExtended[]> => {
        // fetch routers, links and sites and bind them
        const sites = await RESTApi.fetchSites();
        const routers = await RESTApi.fetchRouters();
        const links = await RESTApi.fetchLinks();

        const linksExtendedMap = bindLinksWithSiteIds(links, routers);

        // extend each site with the connected prop that contains the connected sites (from  site to the other one)
        const sitesConnected = sites.map((site) => ({
            ...site,
            connected: [...new Set(linksExtendedMap[site.identity])], // remove duplicates
        }));

        return sitesConnected;
    },

    getProcessesLinks: async (): Promise<DeploymentLinkTopology[]> => {
        const links = await RESTApi.fetchFlowAggregatesProcesses();

        const processesLinks = links.map(({ identity, sourceId, destinationId }) => ({
            key: identity,
            source: sourceId,
            target: destinationId,
        }));

        return processesLinks;
    },

    getProcessGroupsLinks: async (): Promise<DeploymentLinkTopology[]> => {
        const links = await RESTApi.fetchFlowAggregatesProcessgroups();

        const processGroupsLinks = links.map(({ identity, sourceId, destinationId }) => ({
            key: identity,
            source: sourceId,
            target: destinationId,
        }));

        return processGroupsLinks;
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

    getProcessGroupMetrics: async (id: string): Promise<ProcessGroupMetrics> => {
        const process = await RESTApi.fetchProcessGroup(id);
        const flowAggregatesPairs = await RESTApi.fetchFlowAggregatesProcessgroups();

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesProcessGroup(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchFlowAggregatesProcessGroup(flowAggregatesPairsId),
            ),
        ).catch((error) => Promise.reject(error));

        return {
            ...process,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getSiteNodes: (sites: SiteResponse[]): TopologyNode[] =>
        sites
            ?.sort((a, b) => a.identity.localeCompare(b.identity))
            .map((node, index) => {
                const positions = localStorage.getItem(node.identity);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                return {
                    id: node.identity,
                    name: node.name,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    type: 'site',
                    groupName: node.name,
                    group: index,
                    color: getColor(index),
                };
            }),

    getSiteEdges: (sites: SiteExtended[]): TopologyEdges[] =>
        sites?.flatMap(({ identity: sourceId, connected }) =>
            connected.flatMap((targetId) => [
                {
                    source: sourceId,
                    target: targetId,
                    type: 'dashed',
                },
            ]),
        ),

    getProcessGroupNodes: (processGroups: ProcessGroupResponse[]): TopologyNode[] =>
        processGroups
            ?.sort((a, b) => a.identity.localeCompare(b.identity))
            .map((node, index) => {
                const positions = localStorage.getItem(node.identity);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                return {
                    id: node.identity,
                    name: node.name,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    type: 'processgroups',
                    groupName: node.name,
                    group: index,
                    color: getColor(index),
                };
            }),

    getProcessGroupNodesEdges: (deploymentsLinks: DeploymentLinkTopology[]): TopologyEdges[] =>
        deploymentsLinks?.flatMap(({ source, target }) => ({
            source,
            target,
        })),

    getProcessNodes: (deployments: ProcessResponse[], siteNodes: TopologyNode[]): TopologyNode[] =>
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
                    type: 'process',
                    groupName: site?.name || '',
                    group: groupIndex,
                    color: getColor(groupIndex),
                };
            })
            .sort((a, b) => a.group - b.group),

    getProcessEdge: (deploymentsLinks: DeploymentLinkTopology[]): TopologyEdges[] =>
        deploymentsLinks?.flatMap(({ source, target }) => ({
            source,
            target,
        })),
};

const getColor = (index: number) => colors[index % colors.length];
