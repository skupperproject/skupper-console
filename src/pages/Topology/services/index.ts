import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { nodeColors } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
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

  getProcessesLinksFromProcessPairs: (processesPairs: ProcessPairsResponse[]): GraphEdge[] =>
    processesPairs.map(({ identity, sourceId, destinationId }) => ({
      id: identity,
      source: sourceId,
      target: destinationId
    })),

  getProcessesLinksFromFlowPairs: (flowPairsByAddress: FlowPairsResponse[]): GraphEdge[] =>
    flowPairsByAddress.reduce<GraphEdge[]>((acc, { processAggregateId }) => {
      const [source, target] = processAggregateId.split('-to-');
      const exists = acc.some((processLink) => processLink.source === source && processLink.target === target);
      if (!exists) {
        acc.push({
          id: processAggregateId,
          source,
          target
        });
      }

      return acc;
    }, []),

  getNodesFromSitesOrProcessGroups: (entities: SiteResponse[] | ProcessGroupResponse[]): GraphNode[] =>
    entities
      ?.sort((a, b) => a.identity.localeCompare(b.identity))
      .map(({ identity, name: label, recType, processGroupRole }, index) => {
        const { x, y } = getPositionFromLocalStorage(identity);
        const color = getColor(processGroupRole === 'internal' ? 16 : index);

        return {
          id: identity,
          label,
          x,
          y,
          comboId: identity,
          style: {
            fill: color,
            stroke: color,
            shadowColor: color,
            img: processGroupRole === 'internal' ? skupperProcessSVG : recType === 'SITE' ? siteSVG : processSVG
          }
        };
      }),

  getGroupsOfNotEmptySites: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.comboId)).map(({ id, style, label }) => ({ id, label, style }));
  },

  getNodesFromProcesses: (processes: ProcessResponse[], groups: GraphNode[]): GraphNode[] =>
    processes
      ?.map(({ name: label, identity, parent: comboId, processRole }) => {
        const { x, y } = getPositionFromLocalStorage(identity);

        const groupIndex = groups.findIndex(({ id }) => id === comboId);
        const color = getColor(processRole === 'internal' ? 16 : groupIndex);

        return {
          id: identity,
          label,
          x,
          y,
          comboId,
          style: {
            fill: color,
            stroke: color,
            img: processRole === 'internal' ? skupperProcessSVG : processSVG
          }
        };
      })
      .sort((a, b) => a.comboId.localeCompare(b.comboId)),

  getEdgesFromProcessGroups: (links: ProcessPairsResponse[]): GraphEdge[] =>
    links.map(({ identity, sourceId, destinationId }) => ({
      id: identity,
      source: sourceId,
      target: destinationId
    })),

  getEdgesFromSitesConnected: (sites: SiteExtended[]): GraphEdge[] =>
    sites?.flatMap(({ identity: sourceId, connected }) =>
      connected.flatMap((targetId) => [
        {
          id: `${sourceId}-to${targetId}`,
          source: sourceId,
          target: targetId
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
