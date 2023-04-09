import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { nodeColors } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphGroup, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
import { SiteExtended } from '@pages/Sites/Sites.interfaces';
import {
  ProcessPairsResponse,
  FlowPairsResponse,
  LinkResponse,
  ProcessGroupResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse
} from 'API/REST.interfaces';

import { LinkTopology } from './services.interfaces';

export const TopologyController = {
  // Add to each site the prop connected that is a collection of bound site ids  using the command 'skupper link create'
  // This prop is used to show the edges in the topology sites
  getSitesWithLinksCreated: (
    sites: SiteResponse[],
    routers: RouterResponse[],
    links: LinkResponse[]
  ): SiteExtended[] => {
    const linksExtendedMap = bindLinksWithSiteIds(links, routers);

    // extend each site with the connected prop that contains the connected sites (from  site to the other one)
    const sitesConnected = sites.map((site) => ({
      ...site,
      connected: [...new Set(linksExtendedMap[site.identity])] // remove duplicates
    }));

    return sitesConnected;
  },

  getProcessesLinksFromProcessPairs: (processesPairs: ProcessPairsResponse[]): LinkTopology[] => {
    const processesLinks = processesPairs.map(({ identity, sourceId, destinationId }) => ({
      key: identity,
      source: sourceId,
      clickable: true,
      target: destinationId
    }));

    return processesLinks;
  },

  getProcessesLinksFromFlowPairs: (flowPairsByAddress: FlowPairsResponse[]): LinkTopology[] =>
    flowPairsByAddress.reduce<LinkTopology[]>((acc, { identity, processAggregateId }) => {
      const [source, target] = processAggregateId.split('-to-');
      const exists = acc.some((processLink) => processLink.source === source && processLink.target === target);
      if (!exists) {
        acc.push({
          key: identity,
          clickable: true,
          source,
          target
        });
      }

      return acc;
    }, []),

  getProcessGroupsLinks: (links: ProcessPairsResponse[]): LinkTopology[] => {
    const processGroupsLinks = links.map(({ identity, sourceId, destinationId }) => ({
      key: identity,
      source: sourceId,
      target: destinationId
    }));

    return processGroupsLinks;
  },

  getNodesFromSitesOrProcessGroups: (entities: SiteResponse[] | ProcessGroupResponse[]): GraphNode[] =>
    entities
      ?.sort((a, b) => a.identity.localeCompare(b.identity))
      .map(({ identity, name: label, recType, processGroupRole }, index) => {
        const { x, y } = getPositionFromLocalStorage(identity);

        return {
          id: identity,
          label,
          x,
          y,
          group: identity,
          style: {
            fill: getColor(processGroupRole === 'internal' ? 16 : index),
            img: processGroupRole === 'internal' ? skupperProcessSVG : recType === 'SITE' ? siteSVG : processSVG
          }
        };
      }),

  getGroupsOfNotEmptySites: (processes: GraphNode[], sites: GraphNode[]): GraphGroup[] => {
    const groups = processes.map(({ group }) => group);

    return sites
      .filter((site) => groups.includes(site.group))
      .map(({ id, style, label }) => ({ id, color: style.fill, name: label }));
  },

  getNodesFromProcesses: (processes: ProcessResponse[], groups: GraphNode[]): GraphNode[] =>
    processes
      ?.map(({ name: label, identity, parent: group, processRole }) => {
        const { x, y } = getPositionFromLocalStorage(identity);

        const groupIndex = groups.findIndex(({ id }) => id === group);

        return {
          id: identity,
          label,
          x,
          y,
          group,
          style: {
            fill: getColor(processRole === 'internal' ? 16 : groupIndex),
            img: processRole === 'internal' ? skupperProcessSVG : processSVG
          }
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group)),

  getEdgesFromLinks: (links: LinkTopology[]): GraphEdge<string>[] =>
    links?.map(({ source, target, clickable }) => ({
      source,
      target,
      clickable
    })),

  getEdgesFromSitesConnected: (sites: SiteExtended[]): GraphEdge<string>[] =>
    sites?.flatMap(({ identity: sourceId, connected }) =>
      connected.flatMap((targetId) => [
        {
          source: sourceId,
          target: targetId,
          type: 'dashed'
        }
      ])
    )
};

const getColor = (index: number) => nodeColors[index % nodeColors.length];

function getPositionFromLocalStorage(identity: string): { x: number; y: number } {
  const positions = localStorage.getItem(identity);

  const x = positions ? JSON.parse(positions).x : null;
  const y = positions ? JSON.parse(positions).y : null;

  return { x, y };
}
