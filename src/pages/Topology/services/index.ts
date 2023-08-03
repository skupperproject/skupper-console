import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';
import componentSVG from '@assets/component.svg';
import processSVG from '@assets/process.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import {
  DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG,
  DEFAULT_NODE_CONFIG,
  DEFAULT_NODE_ICON,
  DEFAULT_REMOTE_NODE_CONFIG
} from '@core/components/Graph/config';
import { EDGE_COLOR_ACTIVE_DEFAULT, EDGE_COLOR_DEFAULT } from '@core/components/Graph/Graph.constants';
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

import { TopologyLabels } from '../Topology.enum';
import { Entity } from '../Topology.interfaces';

const shape = {
  bound: 'circle',
  unbound: 'diamond'
};

export const TopologyController = {
  convertSitesToNodes: (entities: SiteResponse[]): GraphNode[] =>
    entities.map(({ identity, name, siteVersion }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const img = siteSVG;

      return convertEntityToNode({ id: identity, label: `${name} (${siteVersion})`, x, y, img });
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name, processGroupRole, processCount }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);
      const img = processGroupRole === 'internal' ? skupperProcessSVG : componentSVG;

      const suffix = processCount > 1 ? TopologyLabels.Processes : TopologyLabels.Process;
      const label = `${name} (${processCount} ${suffix})`;

      const nodeConfig = processGroupRole === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape.bound };

      return convertEntityToNode({ id: identity, label, x, y, img, nodeConfig });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role, processBinding }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const img = role === 'internal' ? skupperProcessSVG : processSVG;

      const nodeConfig = role === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape[processBinding] };

      return convertEntityToNode({ id: identity, comboId, label, x, y, img, nodeConfig });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.id)).map(({ id, label }) => ({ id, label }));
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
          type: 'site-edge'
        }
      ])
    );
  },

  addMetricsToLinks: (
    links: GraphEdge[],
    byteRateByProcessPairs?: PrometheusApiSingleResult[],
    latencyByProcessPairs?: PrometheusApiSingleResult[],
    options?: { showLinkLabelReverse?: boolean; rotateLabel?: boolean }
  ): GraphEdge[] => {
    const byteRateByProcessPairsMap = (byteRateByProcessPairs || []).reduce(
      (acc, { metric, value }) => {
        {
          acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);
        }

        return acc;
      },
      {} as Record<string, number>
    );

    const latencyByProcessPairsMap = (latencyByProcessPairs || []).reduce(
      (acc, { metric, value }) => {
        acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);

        return acc;
      },
      {} as Record<string, number>
    );

    return links.map((link) => {
      const byterate = byteRateByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const byterateReverse = byteRateByProcessPairsMap[`${link.targetName}${link.sourceName}`];
      const latency = latencyByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const latencyReverse = latencyByProcessPairsMap[`${link.targetName}${link.sourceName}`];

      const color = byterate ? EDGE_COLOR_ACTIVE_DEFAULT : EDGE_COLOR_DEFAULT;

      const reverseByteRate = options?.showLinkLabelReverse ? `(${formatByteRate(byterateReverse)})` : '';
      const reverseLatency = options?.showLinkLabelReverse ? `(${formatLatency(latencyReverse)})` : '';

      const metrics = [
        byterate ? `\n\n${formatByteRate(byterate)} ${reverseByteRate}` : undefined,
        latency ? `\n${formatLatency(latency)} ${reverseLatency}` : undefined
      ];

      return {
        ...link,
        labelCfg: { autoRotate: !options?.rotateLabel, style: { fill: color } },
        style: { ...link.style, stroke: color },
        label: [link.label, ...metrics].filter(Boolean).join('')
      };
    });
  },
  selectLayoutFromNodes: (nodes: GraphNode[], type: 'combo' | 'default' = 'default') => {
    let layout = undefined;
    const nodeCount = !!nodes.filter((node) => node.x === undefined && node.y === undefined).length;

    if (nodeCount) {
      if (type === 'combo') {
        layout = DEFAULT_LAYOUT_COMBO_FORCE_CONFIG;
      } else {
        layout = nodes.length <= 200 ? DEFAULT_LAYOUT_FORCE_CONFIG : DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG;
      }
    }

    return layout;
  }
};

function convertEntityToNode({ id, comboId, label, x, y, img, nodeConfig }: Entity): GraphNode {
  return {
    id,
    comboId,
    label,
    x,
    y,
    ...{ ...DEFAULT_NODE_CONFIG, icon: { ...DEFAULT_NODE_ICON, img }, ...nodeConfig }
  };
}
