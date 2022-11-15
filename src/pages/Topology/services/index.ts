import { xml } from 'd3-fetch';

import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { SiteExtended } from '@pages/Sites/Sites.interfaces';
import { RESTApi } from 'API/REST';
import { ProcessGroupResponse, ProcessResponse, SiteResponse } from 'API/REST.interfaces';

import { colors } from '../Topology.constant';
import {
    LinkTopology,
    ProcessesMetrics,
    ProcessGroupMetrics,
    SitesMetrics,
} from './services.interfaces';

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

    getProcessesLinks: async (): Promise<LinkTopology[]> => {
        const links = await RESTApi.fetchProcessesPairs();

        const processesLinks = links.map(({ identity, sourceId, destinationId }) => ({
            key: identity,
            source: sourceId,
            target: destinationId,
        }));

        return processesLinks;
    },

    getProcessesLinksByAddress: async (id: string): Promise<LinkTopology[]> => {
        const links = await RESTApi.fetchFlowPairsByAddress(id);

        const processesLinks = links.map(({ identity, processAggregateId }) => ({
            key: identity,
            source: processAggregateId.split('-to-')[0],
            target: processAggregateId.split('-to-')[1],
        }));

        return processesLinks;
    },

    getProcessGroupsLinks: async (): Promise<LinkTopology[]> => {
        const links = await RESTApi.fetchProcessgroupsPairs();

        const processGroupsLinks = links.map(({ identity, sourceId, destinationId }) => ({
            key: identity,
            source: sourceId,
            target: destinationId,
        }));

        return processGroupsLinks;
    },

    getSiteMetrics: async (id: string): Promise<SitesMetrics> => {
        const site = await RESTApi.fetchSite(id);
        const flowAggregatesPairs = await RESTApi.fetchSitesPairs();

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchSitePairs(flowAggregatesPairsId),
            ),
        );

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchSitePairs(flowAggregatesPairsId),
            ),
        );

        return {
            ...site,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getProcessMetrics: async (id: string): Promise<ProcessesMetrics> => {
        const process = await RESTApi.fetchProcess(id);
        const flowAggregatesPairs = await RESTApi.fetchProcessesPairs({
            filters: {
                sourceId: id,
                destinationId: id,
            },
        });

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchProcessPairs(flowAggregatesPairsId),
            ),
        );

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchProcessPairs(flowAggregatesPairsId),
            ),
        );

        return {
            ...process,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getProcessGroupMetrics: async (id: string): Promise<ProcessGroupMetrics> => {
        const process = await RESTApi.fetchProcessGroup(id);
        const flowAggregatesPairs = await RESTApi.fetchProcessgroupsPairs({
            filters: {
                sourceId: id,
                destinationId: id,
            },
        });

        const flowAggregatesOutgoingPairsIds = flowAggregatesPairs
            .filter(({ sourceId }) => id === sourceId)
            .map(({ identity }) => identity);

        const flowAggregatesIncomingPairsIds = flowAggregatesPairs
            .filter(({ destinationId }) => id === destinationId)
            .map(({ identity }) => identity);

        const flowAggregatesOutgoingPairs = await Promise.all(
            flowAggregatesOutgoingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchProcessGroupPairs(flowAggregatesPairsId),
            ),
        );

        const flowAggregatesIncomingPairs = await Promise.all(
            flowAggregatesIncomingPairsIds.map(async (flowAggregatesPairsId) =>
                RESTApi.fetchProcessGroupPairs(flowAggregatesPairsId),
            ),
        );

        return {
            ...process,
            tcpConnectionsOut: flowAggregatesOutgoingPairs,
            tcpConnectionsIn: flowAggregatesIncomingPairs,
        };
    },

    getNodesFromSitesOrProcessGroups: async (
        entities: SiteResponse[] | ProcessGroupResponse[],
    ): Promise<GraphNode[]> => {
        const skupperProcessGroupXML = await xml(skupperProcessSVG);
        const processGroupXML = await xml(processSVG);
        const siteXML = await xml(siteSVG);

        return entities
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
                    groupName: node.name,
                    group: index,
                    color: getColor(node.type === 'skupper' ? 16 : index),
                    img:
                        node.type === 'skupper'
                            ? skupperProcessGroupXML
                            : node.recType === 'SITE'
                            ? siteXML
                            : processGroupXML,
                };
            });
    },

    getNodesFromProcesses: async (
        processes: ProcessResponse[],
        siteNodes: GraphNode[],
    ): Promise<GraphNode[]> => {
        const skupperProcessGroupXML = await xml(skupperProcessSVG);
        const processGroupXML = await xml(processSVG);

        return processes
            ?.map(({ name, identity, parent, type }) => {
                const site = siteNodes?.find(({ id }) => id === parent);
                const groupIndex = site?.group || 0;

                const positions = localStorage.getItem(identity);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                return {
                    id: identity,
                    name,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    groupName: site?.name || '',
                    group: groupIndex,
                    color: getColor(type === 'skupper' ? 16 : groupIndex),
                    img: type === 'skupper' ? skupperProcessGroupXML : processGroupXML,
                };
            })
            .sort((a, b) => a.group - b.group);
    },

    getEdgesFromLinks: (links: LinkTopology[]): GraphEdge[] =>
        links?.map(({ source, target }) => ({
            source,
            target,
        })),

    getEdgesFromSitesConnected: (sites: SiteExtended[]): GraphEdge[] =>
        sites?.flatMap(({ identity: sourceId, connected }) =>
            connected.flatMap((targetId) => [
                {
                    source: sourceId,
                    target: targetId,
                    type: 'dashed',
                },
            ]),
        ),
};

const getColor = (index: number) => colors[index % colors.length];
