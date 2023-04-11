import componentSVG from '@assets/component.svg';
import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { nodeColors } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { GraphController } from '@core/components/Graph/services';
import { bindLinksWithSiteIds } from '@core/utils/bindLinksWithSIteIds';
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
  convertSitesToNodes: (entities: SiteResponse[] | ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name: label }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(index);
      const img = siteSVG;

      return convertEntityToNode({ id: identity, comboId: identity, label, x, y, color, img });
    }),

  convertProcessGroupsToNodes: (entities: SiteResponse[] | ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name: label, processGroupRole: role }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(role === 'internal' ? 16 : index);
      const img = role === 'internal' ? skupperProcessSVG : componentSVG;

      return convertEntityToNode({ id: identity, comboId: identity, label, x, y, color, img });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[], groups: GraphNode[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const groupIndex = groups.findIndex(({ id }) => id === comboId);
      const color = getColor(role === 'internal' ? 16 : groupIndex);
      const img = role === 'internal' ? skupperProcessSVG : processSVG;

      return convertEntityToNode({ id: identity, comboId, label, x, y, color, img });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.comboId)).map(({ id, style, label }) => ({ id, label, style }));
  },

  convertFlowPairsToLinks: (flowPairsByAddress: FlowPairsResponse[]): GraphEdge[] =>
    flowPairsByAddress.reduce<GraphEdge[]>((acc, { processAggregateId: identity }) => {
      const [source, target] = identity.split('-to-');
      //To prevent duplication, we handle cases where two processes have multiple flows, and the resulting source and target values are the same.
      const exists = acc.some((processLink) => processLink.source === source && processLink.target === target);
      if (!exists) {
        acc.push({
          id: identity,
          source,
          target
        });
      }

      return acc;
    }, []),

  convertProcessPairsToLinks: (processesPairs: ProcessPairsResponse[]): GraphEdge[] =>
    processesPairs.map(({ identity, sourceId, destinationId }) => ({
      id: identity,
      source: sourceId,
      target: destinationId
    })),

  // Each site should have a 'targetIds' property that lists the sites it is connected to.
  // The purpose of this property is to display the edges between different sites in the topology.
  getLinksFromSites: (sites: SiteResponse[], routers: RouterResponse[], links: LinkResponse[]): GraphEdge[] => {
    // Create a linksExtendedMap object that maps each site's identity to an array of the IDs of the sites it is connected to
    const linksExtendedMap = bindLinksWithSiteIds(links, routers);

    const sitesWithConnectedProp = sites.map((site) => ({
      ...site,
      targetIds: [...new Set(linksExtendedMap[site.identity])] // 'Set' remove duplicates
    }));

    return sitesWithConnectedProp?.flatMap(({ identity: sourceId, targetIds }) =>
      targetIds.flatMap((targetId) => [
        {
          id: `${sourceId}-to${targetId}`,
          source: sourceId,
          target: targetId
        }
      ])
    );
  }
};

function getColor(index: number) {
  return nodeColors[index % nodeColors.length];
}

interface Entity {
  id: string;
  comboId?: string;
  label: string;
  img: string;
  color: string;
  x: number;
  y: number;
}

function convertEntityToNode({ id, comboId, label, x, y, color, img }: Entity): GraphNode {
  return {
    id,
    comboId,
    label,
    x,
    y,
    icon: {
      show: true,
      img
    },
    style: {
      fill: color,
      stroke: color,
      shadowColor: color,
      img
    }
  };
}
