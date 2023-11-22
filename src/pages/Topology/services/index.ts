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
  DEFAULT_NODE_CONFIG
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
  podman: podmanIcon
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
        iconFileName: img
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
      targetName: destinationName
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
    metricSourceLabel: string, // Prometheus metric label to compare with the metricDestLabel
    metricDestLabel: string,
    protocolPairsMap?: Record<string, string>,
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
    const getPairsMap = (metricPairs: PrometheusApiSingleResult[] | undefined) =>
      (metricPairs || []).reduce(
        (acc, { metric, value }) => {
          {
            if (metric[metricSourceLabel] === metric[metricDestLabel]) {
              // When the source and destination are identical, we should avoid displaying the reverse metric. Instead, we should present the cumulative sum of all directions as a single value.
              acc[`${metric[metricSourceLabel]}${metric[metricDestLabel]}`] =
                (Number(acc[`${metric[metricSourceLabel]}${metric[metricDestLabel]}`]) || 0) + Number(value[1]);
            } else {
              acc[`${metric[metricSourceLabel]}${metric[metricDestLabel]}`] = Number(value[1]);
            }
          }

          return acc;
        },
        {} as Record<string, number>
      );

    const bytesByPairsMap = getPairsMap(bytesByPairs);
    const byteRateByPairsMap = getPairsMap(byteRateByPairs);
    const latencyByPairsMap = getPairsMap(latencyByPairs);

    return links.map((link) => {
      let byteRateText, byteRateReverseText, bytesText, bytesReverseText, latencyText, latencyReverseText, protocolText;

      const pairKey = `${link.sourceName}${link.targetName}`;
      const reversePairKey = `${link.targetName}${link.sourceName}`;

      if (options?.showLinkProtocol && protocolPairsMap) {
        protocolText = protocolPairsMap[`${link.source}${link.target}`] || undefined;
      }

      if (options?.showLinkByteRate) {
        byteRateText = `${formatByteRate(byteRateByPairsMap[pairKey] || 0)}`;

        if (options?.showLinkLabelReverse && link.source !== link.target) {
          byteRateReverseText = `(${formatByteRate(byteRateByPairsMap[reversePairKey] || 0)})`;
        }
      }

      if (options?.showLinkBytes) {
        bytesText = `${formatBytes(bytesByPairsMap[pairKey] || 0)}`;

        if (options?.showLinkLabelReverse && link.source !== link.target) {
          bytesReverseText = `(${formatBytes(bytesByPairsMap[reversePairKey] || 0)})`;
        }
      }

      if (options?.showLinkLatency) {
        latencyText = `${formatLatency(latencyByPairsMap[pairKey] || 0)}`;

        if (options?.showLinkLabelReverse && link.source !== link.target) {
          latencyReverseText = `(${formatLatency(latencyByPairsMap[reversePairKey] || 0)})`;
        }
      }

      const metrics = [bytesText, byteRateText, latencyText].filter(Boolean).join(', ');
      const reverseMetrics = [bytesReverseText, byteRateReverseText, latencyReverseText].filter(Boolean).join(', ');

      return {
        ...link,
        type: link.source === link.target ? CUSTOM_ITEMS_NAMES.loopEdge : CUSTOM_ITEMS_NAMES.animatedDashEdge,
        labelCfg: { autoRotate: !options?.rotateLabel },
        style: { ...link.style, stroke: EDGE_COLOR_DEFAULT },
        label: [protocolText, metrics, reverseMetrics].filter(Boolean).join('\n')
      };
    });
  },

  loadDisplayOptions(key: string, defaultOptions: string[] = []) {
    const displayOptions = localStorage.getItem(key);
    if (displayOptions) {
      return JSON.parse(displayOptions);
    }

    return defaultOptions;
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
