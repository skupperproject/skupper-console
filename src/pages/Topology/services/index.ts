import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { formatByteRate } from '@core/utils/formatBytes';
import { SiteExtended } from '@pages/Sites/Sites.interfaces';
import { RESTApi } from 'API/REST';
import {
    FlowAggregatesResponse,
    FlowPairsResponse,
    LinkResponse,
    ProcessGroupResponse,
    ProcessResponse,
    RouterResponse,
    SiteResponse,
} from 'API/REST.interfaces';

import {
    LinkTopology,
    ProcessConnectedDetail,
    ProcessesMetrics,
    ProcessGroupMetrics,
    SitesMetrics,
} from './services.interfaces';
import { colors } from '../Topology.constant';

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

    getProcessesLinks: (processesPairs: FlowAggregatesResponse[]): LinkTopology[] => {
        const processesLinks = processesPairs.map(
            ({ identity, sourceId, destinationId, sourceOctetRate }) => ({
                key: identity,
                source: sourceId,
                target: destinationId,
                rate: sourceOctetRate ? formatByteRate(sourceOctetRate) : '',
                isActive: false, // TODO: update when the router bug is resolved !!(sourceOctetRate || destinationOctetRate),
            }),
        );

        return processesLinks;
    },

    getProcessesLinksByAddress: (flowPairsByAddress: FlowPairsResponse[]): LinkTopology[] => {
        const processesLinks = flowPairsByAddress.map(({ identity, processAggregateId }) => ({
            key: identity,
            source: processAggregateId.split('-to-')[0],
            target: processAggregateId.split('-to-')[1],
        }));

        return processesLinks;
    },

    getProcessGroupsLinks: (links: FlowAggregatesResponse[]): LinkTopology[] => {
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
        const processPairsTx = await RESTApi.fetchProcessesPairs({
            filter: `sourceId.${id}`,
        });
        const processPairsRx = await RESTApi.fetchProcessesPairs({
            filter: `destinationId.${id}`,
        });

        const tcpConnectionsOut = processPairsTx.map(
            ({ identity, destinationId, destinationName, recordCount, destinationOctetRate }) => ({
                identity,
                processId: destinationId,
                processName: destinationName,
                octetRate: destinationOctetRate || 0,
                recordCount,
            }),
        );

        const tcpConnectionsIn = processPairsRx.map(
            ({ identity, sourceId, sourceName, sourceOctetRate, recordCount }) => ({
                identity,
                processId: sourceId,
                processName: sourceName,
                octetRate: sourceOctetRate || 0,
                recordCount,
            }),
        );

        return {
            ...process,
            tcpConnectionsOut,
            tcpConnectionsIn,
        };
    },

    getProcessGroupMetrics: async (id: string): Promise<ProcessGroupMetrics> => {
        const processGroup = await RESTApi.fetchProcessGroup(id);
        const flowAggregatesPairsTx = await RESTApi.fetchProcessgroupsPairs({
            filter: `sourceId.${id}`,
        });

        const flowAggregatesPairsRx = await RESTApi.fetchProcessgroupsPairs({
            filter: `destinationId.${id}`,
        });

        const processPairsTx = flowAggregatesPairsTx.reduce(
            (acc, { sourceOctetRate, sourceName, sourceId, identity, recordCount }) => {
                acc[identity] = {
                    identity,
                    processId: sourceId,
                    processName: sourceName,
                    octetRate: sourceOctetRate || 0,
                    recordCount,
                };

                return acc;
            },
            {} as Record<string, ProcessConnectedDetail>,
        );

        const processPairsRx = flowAggregatesPairsRx.reduce(
            (
                acc,
                { destinationId, destinationName, identity, destinationOctetRate, recordCount },
            ) => {
                acc[identity] = {
                    identity,
                    processId: destinationId,
                    processName: destinationName,
                    octetRate: destinationOctetRate || 0,
                    recordCount,
                };

                return acc;
            },
            {} as Record<string, ProcessConnectedDetail>,
        );

        return {
            ...processGroup,
            tcpConnectionsOut: Object.values(processPairsTx),
            tcpConnectionsIn: Object.values(processPairsRx),
        };
    },

    getNodesFromSitesOrProcessGroups: (
        entities: SiteResponse[] | ProcessGroupResponse[],
    ): GraphNode[] =>
        entities
            ?.sort((a, b) => a.identity.localeCompare(b.identity))
            .map(({ identity, name, recType, processGroupRole }, index) => {
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
                    color: getColor(processGroupRole === 'internal' ? 16 : index),
                    img:
                        processGroupRole === 'internal'
                            ? skupperProcessSVG
                            : recType === 'SITE'
                            ? siteSVG
                            : processSVG,
                };
            }),

    getNodesFromProcesses: (processes: ProcessResponse[], parentNodes: GraphNode[]): GraphNode[] =>
        processes
            ?.map(({ name, identity, parent, processRole }) => {
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
                    color: getColor(processRole === 'internal' ? 16 : groupIndex),
                    img: processRole === 'internal' ? skupperProcessSVG : processSVG,
                };
            })
            .sort((a, b) => a.group - b.group),

    getEdgesFromLinks: (links: LinkTopology[]): GraphEdge<string>[] =>
        links?.map(({ source, target, isActive, rate }) => ({
            source,
            target,
            isActive,
            rate,
        })),

    getEdgesFromSitesConnected: (sites: SiteExtended[]): GraphEdge<string>[] =>
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
