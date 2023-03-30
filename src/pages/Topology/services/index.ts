import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
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
import { colors } from '../Topology.constant';

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

  getProcessesLinks: (processesPairs: ProcessPairsResponse[]): LinkTopology[] => {
    const processesLinks = processesPairs.map(({ identity, sourceId, destinationId }) => ({
      key: identity,
      source: sourceId,
      clickable: true,
      target: destinationId
    }));

    return processesLinks;
  },

  getProcessesLinksByAddress: (flowPairsByAddress: FlowPairsResponse[]): LinkTopology[] => {
    const processesLinks = flowPairsByAddress.map(({ identity, processAggregateId }) => ({
      key: identity,
      clickable: true,
      source: processAggregateId.split('-to-')[0],
      target: processAggregateId.split('-to-')[1]
    }));

    return processesLinks;
  },

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
          img: processGroupRole === 'internal' ? skupperProcessSVG : recType === 'SITE' ? siteSVG : processSVG
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
          img: processRole === 'internal' ? skupperProcessSVG : processSVG
        };
      })
      .sort((a, b) => a.group - b.group),

  getEdgesFromLinks: (links: LinkTopology[]): GraphEdge<string>[] =>
    links?.map(({ source, target, rate, clickable }) => ({
      source,
      target,
      rate,
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

const getColor = (index: number) => colors[index % colors.length];

function getPosition(identity: string): { fx: number; fy: number } {
  const positions = localStorage.getItem(identity);

  const fx = positions ? JSON.parse(positions).fx : null;
  const fy = positions ? JSON.parse(positions).fy : null;

  return { fx, fy };
}
