import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { SiteExtended } from '@pages/Sites/Sites.interfaces';
import { RESTApi } from 'API/REST';
import {
    LinkResponse,
    ProcessGroupResponse,
    ProcessResponse,
    RouterResponse,
    SiteResponse,
} from 'API/REST.interfaces';

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
    getSitesWithLinksCreated: (
        sites: SiteResponse[],
        routers: RouterResponse[],
        links: LinkResponse[],
    ): SiteExtended[] => {
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

    getNodesFromSitesOrProcessGroups: (
        entities: SiteResponse[] | ProcessGroupResponse[],
    ): GraphNode[] =>
        entities
            ?.sort((a, b) => a.identity.localeCompare(b.identity))
            .map(({ identity, name, recType, type }, index) => {
                const { fx, fy } = getPosition(identity);

                return {
                    id: identity,
                    name,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    groupName: name,
                    group: index,
                    color: getColor(type === 'skupper' ? 16 : index),
                    img:
                        type === 'skupper'
                            ? skupperProcessSVG
                            : recType === 'SITE'
                            ? siteSVG
                            : processSVG,
                };
            }),

    getNodesFromProcesses: (processes: ProcessResponse[], parentNodes: GraphNode[]): GraphNode[] =>
        processes
            ?.map(({ name, identity, parent, type }) => {
                const groupId = parent;
                const parentNode = parentNodes?.find(({ id }) => id === groupId);
                const groupIndex = parentNode?.group || 0;

                const { fx, fy } = getPosition(identity);

                return {
                    id: identity,
                    name,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    groupName: parentNode?.name || '',
                    group: groupIndex,
                    color: getColor(type === 'skupper' ? 16 : groupIndex),
                    img: type === 'skupper' ? skupperProcessSVG : processSVG,
                };
            })
            .sort((a, b) => a.group - b.group),

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

function getPosition(identity: string): { fx: number; fy: number } {
    let positions = localStorage.getItem(identity);

    if (!positions) {
        const newIdentity = identity.split('pGroup');
        if (newIdentity[1]) {
            positions = localStorage.getItem(newIdentity[1]);
        }
    }

    const fx = positions ? JSON.parse(positions).fx : null;
    const fy = positions ? JSON.parse(positions).fy : null;

    return { fx, fy };
}
