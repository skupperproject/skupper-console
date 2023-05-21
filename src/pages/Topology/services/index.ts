import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';
import componentSVG from '@assets/component.svg';
import processSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { DEFAULT_NODE_CONFIG, DEFAULT_REMOTE_NODE_CONFIG } from '@core/components/Graph/config';
import {
  EDGE_COLOR_ACTIVE_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  nodeColors
} from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { GraphController } from '@core/components/Graph/services';
import { formatByteRate } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
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

const shape = {
  bound: 'circle',
  unbound: 'diamond'
};

export const TopologyController = {
  convertSitesToNodes: (entities: SiteResponse[]): GraphNode[] =>
    entities.map(({ identity, name: label }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(index);
      const img = siteSVG;

      const style = {
        fillOpacity: 0.1,
        fill: color,
        stroke: color,
        shadowColor: color
      };

      return convertEntityToNode({ id: identity, label, x, y, img, nodeConfig: { style } });
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name, processGroupRole, processCount }, index) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const color = getColor(processGroupRole === 'internal' ? 16 : index);
      const img = processGroupRole === 'internal' ? skupperProcessSVG : componentSVG;

      const suffix = processCount > 1 ? Labels.Processes : Labels.Process;
      const label = `${name} (${processCount} ${suffix})`;

      const style = {
        fillOpacity: 0.1,
        fill: color,
        stroke: color,
        shadowColor: color
      };

      const nodeConfig = processGroupRole === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape.bound, style };

      return convertEntityToNode({ id: identity, label, x, y, img, nodeConfig });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[], groups: GraphNode[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role, processBinding }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const groupIndex = groups.findIndex(({ id }) => id === comboId);
      const color = processBinding === 'bound' ? getColor(role === 'internal' ? 16 : groupIndex) : 'grey';
      const img = role === 'internal' ? skupperProcessSVG : processSVG;

      const style = {
        fillOpacity: 0.1,
        fill: color,
        stroke: color,
        shadowColor: color
      };

      const nodeConfig = role === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape[processBinding], style };

      return convertEntityToNode({ id: identity, comboId, label, x, y, img, nodeConfig });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites
      .filter((site) => groups.includes(site.id))
      .map(({ id, style, label }) => ({ id, label, style: { ...style, fillOpacity: 0.02 } }));
  },

  convertFlowPairsToLinks: (flowPairsByAddress: FlowPairsResponse[], showProtocol = false): GraphEdge[] =>
    flowPairsByAddress.reduce<GraphEdge[]>(
      (
        acc,
        {
          processAggregateId: identity,
          protocol,
          forwardFlow: { processName: sourceName },
          counterFlow: { processName: targetName }
        }
      ) => {
        const [source, target] = identity.split('-to-');
        //To prevent duplication, we handle cases where two processes have multiple flows, and the resulting source and target values are the same.
        const exists = acc.some((processLink) => processLink.source === source && processLink.target === target);
        if (!exists) {
          acc.push({
            id: identity,
            source,
            target,
            sourceName,
            targetName,
            label: (showProtocol && protocol) || ''
          });
        }

        return acc;
      },
      []
    ),

  convertProcessPairsToLinks: (processesPairs: ProcessPairsResponse[], showProtocol = false): GraphEdge[] =>
    processesPairs.map(({ identity, sourceId, destinationId, protocol, sourceName, destinationName }) => ({
      id: identity,
      source: sourceId,
      target: destinationId,
      sourceName,
      targetName: destinationName,
      label: (showProtocol && protocol) || ''
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
  },
  addMetricsToLinks: (
    links: GraphEdge[],
    byteRateByProcessPairs?: PrometheusApiSingleResult[],
    latencyByProcessPairs?: PrometheusApiSingleResult[]
  ): GraphEdge[] => {
    const byteRateByProcessPairsMap = (byteRateByProcessPairs || []).reduce((acc, { metric, value }) => {
      acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);

      return acc;
    }, {} as Record<string, number>);

    const latencyByProcessPairsMap = (latencyByProcessPairs || []).reduce((acc, { metric, value }) => {
      acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);

      return acc;
    }, {} as Record<string, number>);

    return links.map((link) => {
      const byterate = byteRateByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const latency = latencyByProcessPairsMap[`${link.sourceName}${link.targetName}`];

      return {
        ...link,
        labelCfg: { style: { fill: byterate ? EDGE_COLOR_ACTIVE_DEFAULT : NODE_COLOR_DEFAULT } },
        style: { ...link.style, stroke: byterate ? EDGE_COLOR_ACTIVE_DEFAULT : EDGE_COLOR_DEFAULT },
        label: [
          link.label,
          byterate ? formatByteRate(byterate) : undefined,
          latency ? formatLatency(latency) : undefined
        ]
          .filter(Boolean)
          .join(',  ')
      };
    });
  }
};

function getColor(index: number) {
  return nodeColors[index % nodeColors.length];
}

function convertEntityToNode({ id, comboId, label, x, y, img, nodeConfig }: Entity): GraphNode {
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
    ...{ ...DEFAULT_NODE_CONFIG, ...nodeConfig }
  };
}
