import { ClusterIcon, CogIcon } from '@patternfly/react-icons';
import { NodeShape, NodeModel, EdgeStyle, EdgeModel } from '@patternfly/react-topology';

import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';
import {
  DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG,
  NODE_SIZE
} from '@core/components/Graph/config';
import { EDGE_COLOR_ACTIVE_DEFAULT, NODE_COLOR_DEFAULT_LABEL } from '@core/components/Graph/Graph.constants';
import { GraphEdge } from '@core/components/Graph/Graph.interfaces';
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

const shapes = {
  bound: NodeShape.circle,
  unbound: NodeShape.rhombus
};

export const TopologyController = {
  convertSitesToNodes: (entities: SiteResponse[]): NodeModel[] =>
    entities.map(({ identity, name, siteVersion }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      return {
        id: identity,
        label: `${name} (${siteVersion})`,
        type: 'node',
        x,
        y,
        data: {
          icon: ClusterIcon
        },
        width: NODE_SIZE,
        height: NODE_SIZE,
        shape: NodeShape.circle
      };
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): NodeModel[] =>
    entities.map(({ identity, name, processGroupRole, processCount }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const suffix = processCount > 1 ? Labels.Processes : Labels.Process;
      const label = `${name} (${processCount} ${suffix})`;

      const shapeConf =
        processGroupRole === 'remote'
          ? { shape: shapes.bound, width: NODE_SIZE / 2, height: NODE_SIZE / 2 }
          : { shape: shapes.bound, width: NODE_SIZE, height: NODE_SIZE };

      return {
        id: identity,
        label,
        type: 'node',
        x,
        y,
        data: {
          icon: CogIcon
        },
        ...shapeConf
      };
    }),

  convertProcessesToNodes: (processes: ProcessResponse[]): NodeModel[] =>
    processes?.map(({ identity, name: label, processRole: role, processBinding }) => {
      const { x, y } = GraphController.getPositionFromLocalStorage(identity);

      const shapeConf =
        role === 'remote'
          ? { shape: shapes.bound, width: NODE_SIZE / 2, height: NODE_SIZE / 2 }
          : { shape: shapes[processBinding], width: NODE_SIZE, height: NODE_SIZE };

      return {
        id: identity,
        label,
        type: 'node',
        x,
        y,
        data: {
          icon: CogIcon
        },
        ...shapeConf
      };
    }),

  convertSitesToGroups: (processes: ProcessResponse[]): NodeModel[] => {
    const comboMap = processes.reduce((acc, node) => {
      (acc[`${node.parent}@${node.parentName}`] = acc[`${node.parent}@${node.parentName}`] || []).push(node.identity);

      return acc;
    }, {} as Record<string, string[]>);

    return Object.keys(comboMap).map((comboId: string) => ({
      id: comboId,
      children: comboMap[comboId],
      type: 'group',
      group: true,
      label: comboId.split('@')[1],
      style: {
        padding: 40,
        border: '1px solid red',
        backgroundColor: 'red'
      }
    }));
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

  convertProcessPairsToLinks: (processesPairs: ProcessPairsResponse[], showProtocol = false): EdgeModel[] =>
    processesPairs.map(({ identity, sourceId, destinationId, protocol, sourceName, destinationName }) => ({
      id: identity,
      type: 'edge',
      source: sourceId,
      target: destinationId,
      sourceName,
      targetName: destinationName,
      edgeStyle: EdgeStyle.solid,
      label: (showProtocol && protocol) || ''
    })),

  // Each site should have a 'targetIds' property that lists the sites it is connected to.
  // The purpose of this property is to display the edges between different sites in the topology.
  getLinksFromSites: (sites: SiteResponse[], routers: RouterResponse[], links: LinkResponse[]): EdgeModel[] => {
    const sitesWithLinks = SitesController.bindLinksWithSiteIds(sites, links, routers);

    return sitesWithLinks.flatMap(({ identity: sourceId, targetIds }) =>
      targetIds.flatMap((targetId) => [
        {
          id: `${sourceId}-to${targetId}`,
          type: 'edge',
          source: sourceId,
          target: targetId,
          edgeStyle: EdgeStyle.dashed
        }
      ])
    );
  },

  addMetricsToLinks: (
    links: EdgeModel[],
    byteRateByProcessPairs?: PrometheusApiSingleResult[],
    latencyByProcessPairs?: PrometheusApiSingleResult[],
    options?: { showLinkLabelReverse?: boolean; rotateLabel?: boolean }
  ): EdgeModel[] =>
    // const byteRateByProcessPairsMap = (byteRateByProcessPairs || []).reduce((acc, { metric, value }) => {
    //   {
    //     acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);
    //   }

    //   return acc;
    // }, {} as Record<string, number>);

    // const latencyByProcessPairsMap = (latencyByProcessPairs || []).reduce((acc, { metric, value }) => {
    //   acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);

    //   return acc;
    // }, {} as Record<string, number>);

    links.map((link) => {
      const byterate = 0; //byteRateByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const byterateReverse = 0; // byteRateByProcessPairsMap[`${link.targetName}${link.sourceName}`];
      const latency = 0; //encyByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const latencyReverse = 0; // latencyByProcessPairsMap[`${link.targetName}${link.sourceName}`];

      const color = byterate ? EDGE_COLOR_ACTIVE_DEFAULT : NODE_COLOR_DEFAULT_LABEL;

      const reverseByteRate = options?.showLinkLabelReverse ? `(${formatByteRate(byterateReverse)})` : '';
      const reverseLatency = options?.showLinkLabelReverse ? `(${formatLatency(latencyReverse)})` : '';

      const metrics = [
        byterate ? `\n\n${formatByteRate(byterate)} ${reverseByteRate}` : undefined,
        latency ? `\n${formatLatency(latency)} ${reverseLatency}` : undefined
      ];

      return {
        ...link,
        labelCfg: { autoRotate: options?.rotateLabel, style: { fill: color } },
        style: { ...link.style, stroke: color },
        label: [link.label, ...metrics].filter(Boolean).join('')
      };
    }),
  selectLayoutFromNodes: (nodes: NodeModel[], type: 'combo' | 'default' = 'default') => {
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
