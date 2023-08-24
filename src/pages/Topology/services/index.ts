import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';
import componentSVG from '@assets/component.svg';
import processSVG from '@assets/process.svg';
import siteSVG from '@assets/site.svg';
import skupperProcessSVG from '@assets/skupper.svg';
import { DEFAULT_NODE_CONFIG, DEFAULT_NODE_ICON, DEFAULT_REMOTE_NODE_CONFIG } from '@core/components/Graph/config';
import { EDGE_COLOR_DEFAULT, EDGE_COLOR_ACTIVE_DEFAULT } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import SitesController from '@pages/Sites/services';
import {
  ProcessPairsResponse,
  LinkResponse,
  ProcessGroupResponse,
  ProcessResponse,
  RouterResponse,
  SiteResponse
} from 'API/REST.interfaces';

import { TopologyLabels } from '../Topology.enum';
import { Entity, TopologyMetrics, TopologyMetricsMetrics } from '../Topology.interfaces';

const shape = {
  bound: 'circle',
  unbound: 'diamond'
};

export const TopologyController = {
  getMetrics: async ({
    showBytes = false,
    showByteRate = false,
    showLatency = false
  }: TopologyMetricsMetrics): Promise<TopologyMetrics> => {
    try {
      const [bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs] = await Promise.all([
        showBytes ? PrometheusApi.fetchAllProcessPairsBytes() : [],
        showByteRate ? PrometheusApi.fetchAllProcessPairsByteRates() : [],
        showLatency ? PrometheusApi.fetchAllProcessPairsLatencies() : []
      ]);

      return { bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  convertSitesToNodes: (entities: SiteResponse[]): GraphNode[] =>
    entities.map(({ identity, name, siteVersion }) => {
      const img = siteSVG;

      return convertEntityToNode({ id: identity, label: `${name} (${siteVersion})`, img });
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name, processGroupRole, processCount }) => {
      const img = processGroupRole === 'internal' ? skupperProcessSVG : componentSVG;

      const suffix = processCount > 1 ? TopologyLabels.Processes : TopologyLabels.Process;
      const label = `${name} (${processCount} ${suffix})`;

      const nodeConfig = processGroupRole === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape.bound };

      return convertEntityToNode({ id: identity, label, img, nodeConfig });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role, processBinding }) => {
      const img = role === 'internal' ? skupperProcessSVG : processSVG;

      const nodeConfig = role === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape[processBinding] };

      return convertEntityToNode({ id: identity, comboId, label, img, nodeConfig });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.id)).map(({ id, label }) => ({ id, label }));
  },

  convertProcessPairsToLinks: (processesPairs: ProcessPairsResponse[]): GraphEdge[] =>
    processesPairs.map(({ identity, sourceId, destinationId, sourceName, destinationName }) => ({
      id: identity,
      source: sourceId,
      target: destinationId,
      sourceName,
      targetName: destinationName,
      style: { stroke: EDGE_COLOR_DEFAULT, cursor: 'pointer' }
    })),

  // Each site should have a 'targetIds' property that lists the sites it is connected to.
  // The purpose of this property is to display the edges between different sites in the topology.
  convertLinksToSiteLinks: (sites: SiteResponse[], routers: RouterResponse[], links: LinkResponse[]): GraphEdge[] => {
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
    processesPairs?: ProcessPairsResponse[],
    bytesByProcessPairs?: PrometheusApiSingleResult[],
    byteRateByProcessPairs?: PrometheusApiSingleResult[],
    latencyByProcessPairs?: PrometheusApiSingleResult[],
    options?: {
      showLinkProtocol?: boolean;
      showLinkBytes?: boolean;
      showLinkByteRate?: boolean;
      showLinkLatency?: boolean;
      showLinkLabelReverse?: boolean;
      rotateLabel?: boolean;
    }
  ): GraphEdge[] => {
    const bytesByProcessPairsMap = (bytesByProcessPairs || []).reduce(
      (acc, { metric, value }) => {
        {
          acc[`${metric.sourceProcess}${metric.destProcess}`] = Number(value[1]);
        }

        return acc;
      },
      {} as Record<string, number>
    );

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

    const processesPairsMap = (processesPairs || []).reduce(
      (acc, { sourceId, destinationId, protocol }) => {
        acc[`${sourceId}${destinationId}`] = protocol || '';

        return acc;
      },
      {} as Record<string, string>
    );

    return links.map((link) => {
      const protocol = processesPairsMap[`${link.source}${link.target}`];
      const byterate = byteRateByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const byterateReverse = byteRateByProcessPairsMap[`${link.targetName}${link.sourceName}`];
      const bytes = bytesByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const bytesReverse = bytesByProcessPairsMap[`${link.targetName}${link.sourceName}`];
      const latency = latencyByProcessPairsMap[`${link.sourceName}${link.targetName}`];
      const latencyReverse = latencyByProcessPairsMap[`${link.targetName}${link.sourceName}`];

      const reverseByteRate = options?.showLinkLabelReverse ? `(${formatByteRate(byterateReverse)})` : '';
      const reverseBytes = options?.showLinkLabelReverse ? `(${formatBytes(bytesReverse)})` : '';
      const reverseLatency = options?.showLinkLabelReverse ? `(${formatLatency(latencyReverse)})` : '';

      const protocolLabel = options?.showLinkProtocol ? protocol : undefined;
      const byteRateLabel = options?.showLinkByteRate ? `${formatByteRate(byterate)} ${reverseByteRate}` : undefined;
      const bytesLabel = options?.showLinkBytes ? `${formatBytes(bytes)} ${reverseBytes}` : undefined;
      const latencyLabel = options?.showLinkLatency ? `${formatLatency(latency)} ${reverseLatency}` : undefined;

      const color = options?.showLinkByteRate && byterate ? EDGE_COLOR_ACTIVE_DEFAULT : EDGE_COLOR_DEFAULT;

      return {
        ...link,
        labelCfg: { autoRotate: !options?.rotateLabel, style: { fill: color } },
        style: { ...link.style, stroke: color },
        label: [protocolLabel, bytesLabel, byteRateLabel, latencyLabel].filter(Boolean).join(',  ')
      };
    });
  }
};

function convertEntityToNode({ id, comboId, label, img, nodeConfig }: Entity): GraphNode {
  return {
    id,
    comboId,
    label,
    ...{ ...DEFAULT_NODE_CONFIG, icon: { ...DEFAULT_NODE_ICON, img }, ...nodeConfig }
  };
}
