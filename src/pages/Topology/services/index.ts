import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';
import componentIcon from '@assets/component.svg';
import kubernetesIcon from '@assets/kubernetes.svg';
import podmanIcon from '@assets/podman.png';
import processIcon from '@assets/process.svg';
import siteIcon from '@assets/site.svg';
import skupperIcon from '@assets/skupper.svg';
import {
  EDGE_COLOR_DEFAULT,
  CUSTOM_ITEMS_NAMES,
  DEFAULT_REMOTE_NODE_CONFIG,
  DEFAULT_NODE_ICON,
  DEFAULT_NODE_CONFIG,
  EDGE_COLOR_DEFAULT_TEXT
} from '@core/components/Graph/Graph.constants';
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
  SiteResponse,
  SitePairsResponse
} from 'API/REST.interfaces';

import { Entity, TopologyMetrics, TopologyMetricsMetrics } from '../Topology.interfaces';

const shape = {
  bound: CUSTOM_ITEMS_NAMES.nodeWithBadges,
  unbound: 'diamond'
};

const platformsMap: Record<string, 'kubernetes' | 'podman'> = {
  kubernetes: kubernetesIcon,
  pdoman: podmanIcon
};

export const TopologyController = {
  getMetrics: async ({
    showBytes = false,
    showByteRate = false,
    showLatency = false,
    params
  }: TopologyMetricsMetrics): Promise<TopologyMetrics> => {
    try {
      const [bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs] = await Promise.all([
        showBytes ? PrometheusApi.fetchAllProcessPairsBytes(params.fetchBytes.groupBy) : [],
        showByteRate ? PrometheusApi.fetchAllProcessPairsByteRates(params.fetchByteRate.groupBy) : [],
        showLatency ? PrometheusApi.fetchAllProcessPairsLatencies(params.fetchLatency.groupBy) : []
      ]);

      return { bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  convertSitesToNodes: (entities: SiteResponse[]): GraphNode[] =>
    entities.map(({ identity, name, siteVersion, platform }) => {
      const img = platform && platformsMap[platform] ? platformsMap[platform] : siteIcon;
      const label = siteVersion ? `${name} (${siteVersion})` : name;

      return convertEntityToNode({
        id: identity,
        label,
        iconFileName: img,
        iconProps: { show: true, width: 24, height: 24 }
      });
    }),

  convertProcessGroupsToNodes: (entities: ProcessGroupResponse[]): GraphNode[] =>
    entities.map(({ identity, name, processGroupRole, processCount }) => {
      const img = processGroupRole === 'internal' ? skupperIcon : componentIcon;

      const nodeConfig =
        processGroupRole === 'remote'
          ? DEFAULT_REMOTE_NODE_CONFIG
          : { type: shape.bound, notificationValue: processCount, enableBadge1: true };

      return convertEntityToNode({ id: identity, label: name, iconFileName: img, nodeConfig });
    }),

  convertProcessesToNodes: (processes: ProcessResponse[]): GraphNode[] =>
    processes?.map(({ identity, name: label, parent: comboId, processRole: role, processBinding }) => {
      const img = role === 'internal' ? skupperIcon : processIcon;

      const nodeConfig = role === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape[processBinding] };

      return convertEntityToNode({ id: identity, comboId, label, iconFileName: img, nodeConfig });
    }),

  convertSitesToGroups: (processes: GraphNode[], sites: GraphNode[]): GraphCombo[] => {
    const groups = processes.map(({ comboId }) => comboId);

    return sites.filter((site) => groups.includes(site.id)).map(({ id, label }) => ({ id, label }));
  },

  convertPairsToEdges: (processesPairs: ProcessPairsResponse[] | SitePairsResponse[]): GraphEdge[] =>
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
  convertRouterLinksToEdges: (sites: SiteResponse[], routers: RouterResponse[], links: LinkResponse[]): GraphEdge[] => {
    const sitesWithLinks = SitesController.bindLinksWithSiteIds(sites, links, routers);

    return sitesWithLinks.flatMap(({ identity: sourceId, targetIds }) =>
      targetIds.flatMap((targetId) => [
        {
          id: `${sourceId}-to${targetId}`,
          source: sourceId,
          target: targetId,
          type: CUSTOM_ITEMS_NAMES.siteEdge
        }
      ])
    );
  },

  addMetricsToEdges: (
    links: GraphEdge[],
    pairs: ProcessPairsResponse[] | SitePairsResponse[],
    sourceKey: string,
    destKey: string,
    bytesByPairs?: PrometheusApiSingleResult[],
    byteRateByPairs?: PrometheusApiSingleResult[],
    latencyByPairs?: PrometheusApiSingleResult[],
    options?: {
      showLinkProtocol?: boolean;
      showLinkBytes?: boolean;
      showLinkByteRate?: boolean;
      showLinkLatency?: boolean;
      showLinkLabelReverse?: boolean;
      rotateLabel?: boolean;
    }
  ): GraphEdge[] => {
    const bytesByPairsMap = (bytesByPairs || []).reduce(
      (acc, { metric, value }) => {
        {
          if (metric[sourceKey] === metric[destKey]) {
            acc[`${metric[sourceKey]}${metric[destKey]}`] =
              (Number(acc[`${metric[sourceKey]}${metric[destKey]}`]) || 0) + Number(value[1]);
          } else {
            acc[`${metric[sourceKey]}${metric[destKey]}`] = Number(value[1]);
          }
        }

        return acc;
      },
      {} as Record<string, number>
    );

    const byteRateByPairsMap = (byteRateByPairs || []).reduce(
      (acc, { metric, value }) => {
        {
          // case: A site has internal data traffic
          if (metric[sourceKey] === metric[destKey]) {
            acc[`${metric[sourceKey]}${metric[destKey]}`] =
              (Number(acc[`${metric[sourceKey]}${metric[destKey]}`]) || 0) + Number(value[1]);
          } else {
            acc[`${metric[sourceKey]}${metric[destKey]}`] = Number(value[1]);
          }
        }

        return acc;
      },
      {} as Record<string, number>
    );

    const latencyByPairsMap = (latencyByPairs || []).reduce(
      (acc, { metric, value }) => {
        if (metric[sourceKey] === metric[destKey]) {
          acc[`${metric[sourceKey]}${metric[destKey]}`] =
            (Number(acc[`${metric[sourceKey]}${metric[destKey]}`]) || 0) + Number(value[1]);
        } else {
          acc[`${metric[sourceKey]}${metric[destKey]}`] = Number(value[1]);
        }

        return acc;
      },
      {} as Record<string, number>
    );

    const pairsMap = (pairs || []).reduce(
      (acc, { sourceId, destinationId, protocol }) => {
        acc[`${sourceId}${destinationId}`] = protocol || '';

        return acc;
      },
      {} as Record<string, string>
    );

    return links.map((link) => {
      const protocol = pairsMap[`${link.source}${link.target}`];
      const byterate = byteRateByPairsMap[`${link.sourceName}${link.targetName}`];

      const byterateReverse = byteRateByPairsMap[`${link.targetName}${link.sourceName}`];
      const bytes = bytesByPairsMap[`${link.sourceName}${link.targetName}`];
      const bytesReverse = bytesByPairsMap[`${link.targetName}${link.sourceName}`];
      const latency = latencyByPairsMap[`${link.sourceName}${link.targetName}`];
      const latencyReverse = latencyByPairsMap[`${link.targetName}${link.sourceName}`];

      const reverseByteRate =
        options?.showLinkLabelReverse && link.source !== link.target ? `(${formatByteRate(byterateReverse)})` : '';
      const reverseBytes =
        options?.showLinkLabelReverse && bytesReverse && link.source !== link.target
          ? `(${formatBytes(bytesReverse)})`
          : '';
      const reverseLatency =
        options?.showLinkLabelReverse && latencyReverse && link.source !== link.target
          ? `(${formatLatency(latencyReverse)})`
          : '';

      const protocolLabel = options?.showLinkProtocol && protocol ? protocol : undefined;
      const byteRateLabel =
        options?.showLinkByteRate && byterate ? `${formatByteRate(byterate)} ${reverseByteRate}` : undefined;
      const bytesLabel = options?.showLinkBytes && bytes ? `${formatBytes(bytes)} ${reverseBytes}` : undefined;
      const latencyLabel =
        options?.showLinkLatency && latency ? `${formatLatency(latency)} ${reverseLatency}` : undefined;

      return {
        ...link,
        type: link.source === link.target ? CUSTOM_ITEMS_NAMES.loopEdge : CUSTOM_ITEMS_NAMES.animatedDashEdge,
        labelCfg: { autoRotate: !options?.rotateLabel, style: { fill: EDGE_COLOR_DEFAULT_TEXT } },
        style: { ...link.style, stroke: EDGE_COLOR_DEFAULT },
        label: [protocolLabel, bytesLabel, byteRateLabel, latencyLabel].filter(Boolean).join(',  ')
      };
    });
  }
};

function convertEntityToNode({
  id,
  comboId,
  label,
  iconFileName,
  iconProps = DEFAULT_NODE_ICON,
  nodeConfig
}: Entity): GraphNode {
  return {
    id,
    comboId,
    label,
    ...{ ...DEFAULT_NODE_CONFIG, icon: { ...iconProps, img: iconFileName }, ...nodeConfig }
  };
}
