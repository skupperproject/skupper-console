import { AvailableProtocols } from '@API/REST.enum';
import componentSVG from '@assets/component.svg';
import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { DEFAULT_NODE_CONFIG } from '@core/components/Graph/config';
import { nodeColors } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { GraphController } from '@core/components/Graph/services';
import SitesController from '@pages/Sites/services';
import {
  ProcessPairsResponse,
  FlowPairsResponse,
  LinkResponse,
  ProcessGroupResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse
} from 'API/REST.interfaces';

import { Labels } from '../Topology.enum';
import { Entity } from '../Topology.interfaces';

export const TopologyController = {
  convertSitesToNodes: (entities: SiteResponse[]): GraphNode[] =>
    entities.map(({ identity, name: label }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(index);
      const img = siteSVG;

      return convertEntityToNode({ id: identity, label, x, y, color, img });
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name, processGroupRole, processCount }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(processGroupRole === 'internal' ? 16 : index);
      const img = processGroupRole === 'internal' ? skupperProcessSVG : componentSVG;

      const suffix = processCount > 1 ? Labels.Processes : Labels.Process;
      const label = `${name} (${processCount} ${suffix})`;

      return convertEntityToNode({ id: identity, label, x, y, color, img });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[], groups: GraphNode[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role, processBinding }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const groupIndex = groups.findIndex(({ id }) => id === comboId);
      const color = processBinding === 'bound' ? getColor(role === 'internal' ? 16 : groupIndex) : 'grey';
      const type = processBinding === 'bound' ? 'circle' : 'diamond';

      const img = role === 'internal' ? skupperProcessSVG : processSVG;

      return convertEntityToNode({ id: identity, comboId, label, x, y, color, img, type });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.id)).map(({ id, style, label }) => ({ id, label, style }));
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
    processesPairs.map(({ identity, sourceId, destinationId, protocol }) => ({
      id: identity,
      source: sourceId,
      target: destinationId,
      label: protocol,
      labelCfg: {
        style: {
          fill: protocol === AvailableProtocols.Tcp ? '#ffffff' : '#8A8D90',
          background: {
            fill: protocol === AvailableProtocols.Tcp ? '#6753AC' : '#F2F9F9',
            stroke: '#8A8D90'
          }
        }
      }
    })),

  // Each site should have a 'targetIds' property that lists the sites it is connected to.
  // The purpose of this property is to display the edges between different sites in the topology.
  getLinksFromSites: (sites: SiteResponse[], routers: RouterResponse[], links: LinkResponse[]): GraphEdge[] => {
    const sitesWithLinks = SitesController.bindLinksWithSiteIds(sites, links, routers);

    return sitesWithLinks.flatMap(({ identity: sourceId, targetIds }) =>
      targetIds.flatMap((targetId) => [
        {
          id: `${sourceId}-to${targetId}`,
          source: sourceId,
          target: targetId,
          style: {
            lineDash: [4, 4]
          }
        }
      ])
    );
  }
};

function getColor(index: number) {
  return nodeColors[index % nodeColors.length];
}

function convertEntityToNode({ id, comboId, label, x, y, color, img, type = 'circle' }: Entity): GraphNode {
  return {
    id,
    comboId,
    label,
    x,
    y,
    ...{ ...DEFAULT_NODE_CONFIG },
    type,
    icon: {
      show: true,
      img
    },
    style: {
      fill: color,
      stroke: color,
      shadowColor: color
    }
  };
}
