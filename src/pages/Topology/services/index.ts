import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusMetric } from '@API/Prometheus.interfaces';
import { ProcessPairsResponse, ProcessGroupResponse, ProcessResponse, SitePairsResponse } from '@API/REST.interfaces';
import componentIcon from '@assets/component.svg';
import processIcon from '@assets/process.svg';
import skupperIcon from '@assets/skupper.svg';
import {
  CUSTOM_ITEMS_NAMES,
  DEFAULT_REMOTE_NODE_CONFIG,
  DEFAULT_NODE_ICON,
  DEFAULT_NODE_CONFIG,
  DEFAUT_EDGE_BG_LABEL,
  DEFAUT_EDGE_BG_NO_LABEL
} from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';

import {
  Entity,
  TopologyMetrics,
  TopologyConfigMetrics,
  DisplayOptions,
  ProcessPairsWithMetrics
} from '../Topology.interfaces';

const shape = {
  bound: CUSTOM_ITEMS_NAMES.nodeWithBadges,
  unbound: 'diamond'
};

export const TopologyController = {
  getTopologyMetrics: async ({
    showBytes = false,
    showByteRate = false,
    showLatency = false,
    params
  }: TopologyConfigMetrics): Promise<TopologyMetrics> => {
    try {
      const [bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs] = await Promise.all([
        showBytes ? PrometheusApi.fetchAllProcessPairsBytes(params.fetchBytes.groupBy, params.filterBy) : [],
        showByteRate ? PrometheusApi.fetchAllProcessPairsByteRates(params.fetchByteRate.groupBy, params.filterBy) : [],
        showLatency ? PrometheusApi.fetchAllProcessPairsLatencies(params.fetchLatency.groupBy, params.filterBy) : []
      ]);

      return { bytesByProcessPairs, byteRateByProcessPairs, latencyByProcessPairs };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

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
    processes?.map(
      ({
        identity,
        name: label,
        parent: comboId,
        parentName: comboName,
        groupIdentity,
        groupName,
        processRole: role,
        processBinding
      }) => {
        const img = role === 'internal' ? skupperIcon : processIcon;

        const nodeConfig = role === 'remote' ? DEFAULT_REMOTE_NODE_CONFIG : { type: shape[processBinding] };

        return convertEntityToNode({
          id: identity,
          comboId,
          comboName,
          label,
          iconFileName: img,
          nodeConfig,
          groupId: groupIdentity,
          groupName
        });
      }
    ),

  getNodeGroupsFromNodes: (nodes: GraphNode[]): GraphCombo[] => {
    const idLabelPairs = nodes
      .map(({ comboId, comboName }) => ({ id: comboId || '', label: comboName || '' }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // TODO: BE-bug: The API occasionally returns processes without a siteName for a site.
    // While in some cases, using the hostname as a substitute is acceptable, it can lead to conflicts.
    // This inconsistency results in situations where the hostname and siteName differ but share the same ID.
    const uniqueNodes = [...new Map(idLabelPairs.map((item) => [item.id, item])).values()];

    return removeDuplicatesFromArrayOfObjects(uniqueNodes);
  },

  convertPairsToEdges: (processesPairs: ProcessPairsResponse[] | SitePairsResponse[]): GraphEdge[] =>
    processesPairs.map(({ identity, sourceId, destinationId, sourceName, destinationName }) => ({
      id: identity,
      source: sourceId,
      target: destinationId,
      sourceName,
      targetName: destinationName
    })),

  addMetricsToProcessPairs: ({ processesPairs, metrics, prometheusKey, processPairsKey }: ProcessPairsWithMetrics) => {
    const getPairsMap = (metricPairs: PrometheusMetric<'vector'>[] | undefined, key: string) =>
      (metricPairs || []).reduce(
        (acc, { metric, value }) => {
          {
            if (metric.sourceProcess === metric.destProcess) {
              // When the source and destination are identical, we should avoid displaying the reverse metric. Instead, we should present the cumulative sum of all directions as a single value.
              acc[`${metric[key]}`] = (Number(acc[`${metric[key]}`]) || 0) + Number(value[1]);
            } else {
              acc[`${metric[key]}`] = Number(value[1]);
            }
          }

          return acc;
        },
        {} as Record<string, number>
      );

    const txBytesByPairsMap = getPairsMap(metrics?.bytesByProcessPairs, prometheusKey);
    const txByteRateByPairsMap = getPairsMap(metrics?.byteRateByProcessPairs, prometheusKey);
    const txLatencyByPairsMap = getPairsMap(metrics?.latencyByProcessPairs, prometheusKey);

    return processesPairs?.map((processPairsData) => ({
      ...processPairsData,
      bytes: txBytesByPairsMap[processPairsData[processPairsKey]] || 0,
      byteRate: txByteRateByPairsMap[processPairsData[processPairsKey]] || 0,
      latency: txLatencyByPairsMap[processPairsData[processPairsKey]] || 0
    }));
  },

  addMetricsToEdges: (
    edges: GraphEdge[],
    metricSourceLabel: 'sourceProcess' | 'sourceSite', // Prometheus metric label to compare with the metricDestLabel
    metricDestLabel: 'destProcess' | 'destSite',
    protocolPairsMap?: Record<string, string>,
    bytesByPairs?: PrometheusMetric<'vector'>[],
    byteRateByPairs?: PrometheusMetric<'vector'>[],
    latencyByPairs?: PrometheusMetric<'vector'>[]
  ): GraphEdge[] => {
    const getPairsMap = (metricPairs: PrometheusMetric<'vector'>[] | undefined) =>
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

    return edges.map((edge) => {
      const pairKey = `${edge.sourceName}${edge.targetName}`;
      const reversePairKey = `${edge.targetName}${edge.sourceName}`;

      return {
        ...edge,
        metrics: {
          protocol: protocolPairsMap ? protocolPairsMap[`${edge.source}${edge.target}`] : '',
          bytes: bytesByPairsMap[pairKey],
          byteRate: byteRateByPairsMap[pairKey],
          latency: latencyByPairsMap[pairKey],
          bytesReverse: bytesByPairsMap[reversePairKey],
          byteRateReverse: byteRateByPairsMap[reversePairKey],
          latencyReverse: latencyByPairsMap[reversePairKey]
        }
      };
    });
  },

  configureEdges: (edges: GraphEdge[], options?: DisplayOptions): GraphEdge[] =>
    edges.map((edge) => {
      const protocolText = options?.showLinkProtocol && edge?.metrics?.protocol;
      const byteRateText = edge?.metrics?.byteRate && `${formatByteRate(edge?.metrics?.byteRate || 0)}`;
      const bytesText = edge?.metrics?.bytes && `${formatBytes(edge?.metrics?.bytes || 0)}`;
      const latencyText = edge?.metrics?.latency && `${formatLatency(edge?.metrics?.latency || 0)}`;

      const isTheSameEdge = edge.source !== edge.target;

      const byteRateReverseText =
        !isTheSameEdge &&
        edge?.metrics?.byteRate &&
        options?.showLinkLabelReverse &&
        `(${formatByteRate(edge?.metrics?.byteRateReverse || 0)})`;
      const bytesReverseText =
        !isTheSameEdge &&
        edge?.metrics?.bytes &&
        options?.showLinkLabelReverse &&
        `(${formatBytes(edge?.metrics?.bytesReverse || 0)})`;
      const latencyReverseText =
        !isTheSameEdge &&
        edge?.metrics?.latency &&
        options?.showLinkLabelReverse &&
        `(${formatLatency(edge?.metrics?.latencyReverse || 0)})`;

      const metrics = [bytesText, byteRateText, latencyText].filter(Boolean).join(', ');
      const reverseMetrics = [bytesReverseText, byteRateReverseText, latencyReverseText].filter(Boolean).join(', ');

      const label = [protocolText, metrics, reverseMetrics].filter(Boolean).join('\n');

      return {
        ...edge,
        type: edge.source === edge.target ? CUSTOM_ITEMS_NAMES.loopEdge : CUSTOM_ITEMS_NAMES.animatedDashEdge,
        labelCfg: {
          autoRotate: !options?.rotateLabel,
          style: {
            background: label ? DEFAUT_EDGE_BG_LABEL : DEFAUT_EDGE_BG_NO_LABEL
          }
        },
        label
      };
    }),

  loadDisplayOptionsFromLocalStorage(key: string) {
    const displayOptions = localStorage.getItem(key);
    if (displayOptions) {
      return JSON.parse(displayOptions);
    }

    return null;
  }
};

export function convertEntityToNode({
  id,
  comboId,
  comboName,
  groupId,
  groupName,
  label,
  iconFileName,
  iconProps = DEFAULT_NODE_ICON,
  nodeConfig
}: Entity): GraphNode {
  return {
    id,
    comboId,
    comboName,
    groupId,
    groupName,
    label,
    ...{ ...DEFAULT_NODE_CONFIG, icon: { ...iconProps, img: iconFileName }, ...nodeConfig }
  };
}

/**
 * Groups an array of GraphNode objects based on their comboId and groupId properties.
 */
export function groupNodes(data: GraphNode[]): GraphNode[] {
  const groupedNodes: Record<string, GraphNode> = {};

  data.forEach((item) => {
    // Create a unique key based on the combination of comboId and groupId
    const group = `${item.comboId}-${item.groupId}`;

    if (!groupedNodes[group]) {
      groupedNodes[group] = {
        ...item,
        id: '', // The 'id' string will be concatenated with the process ID
        comboId: item.comboId,
        groupCount: 0
      };
    }

    // Concatenate the process ID to the 'id' string
    //! not null assertion operator  https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
    if (groupedNodes[group].groupCount! > 0) {
      groupedNodes[group].id += '~';
    }

    groupedNodes[group].id += item.id;
    groupedNodes[group].groupCount! += 1;

    if (groupedNodes[group].groupCount! > 1) {
      groupedNodes[group].label = `${item.groupName}-${item.comboName}` || '';
      groupedNodes[group].type = shape.bound;
      groupedNodes[group].notificationValue = groupedNodes[group].groupCount;
      groupedNodes[group].enableBadge1 = true;
    }
  });

  // Convert groupedNodes object to an array
  return Object.values(groupedNodes);
}

/**
 * Combines the edges of a graph with the corresponding nodes or grouped nodes.
 */
export function groupEdges(nodes: GraphNode[], edges: GraphEdge[]): GraphEdge[] {
  // Reduce the array of edges to a mapping of combined edges
  const edgeMap: { [key: string]: GraphEdge } = edges.reduce(
    (acc, edge) => {
      // Find matching nodes for source and target in the nodes array
      const sourceMatch = nodes.find(({ id }) => id.includes(edge.source));
      const targetMatch = nodes.find(({ id }) => id.includes(edge.target));

      // Update source and target with matched node IDs, if found
      const newSource = sourceMatch ? sourceMatch.id : edge.source;
      const newTarget = targetMatch ? targetMatch.id : edge.target;

      // Create a unique key based on the combination of newSource and newTarget
      const group = `${newSource}-${newTarget}`;

      // If the key already exists, add the metrics, otherwise, add the new edge
      acc[group] = acc[group] || {
        ...edge,
        id: '', // The 'id' string will be concatenated with the process ID
        metrics: {
          protocol: '',
          bytes: 0,
          byteRate: 0,
          latency: 0,
          bytesReverse: 0,
          byteRateReverse: 0,
          latencyReverse: 0
        },
        source: newSource,
        target: newTarget
      };

      if (acc[group].id !== '') {
        acc[group].id += '~';
      }

      acc[group].id += edge.id;

      if (edge.metrics) {
        acc[group].metrics = {
          protocol:
            edge.metrics.protocol && acc[group]?.metrics?.protocol?.includes(edge.metrics.protocol)
              ? acc[group]?.metrics?.protocol || ''
              : [acc[group]?.metrics?.protocol, edge.metrics.protocol].filter(Boolean).join(','),
          bytes: (acc[group]?.metrics?.bytes || 0) + (edge.metrics.bytes || 0),
          byteRate: (acc[group]?.metrics?.byteRate || 0) + (edge.metrics.byteRate || 0),
          latency: (acc[group]?.metrics?.latency || 0) + (edge.metrics.latency || 0),
          bytesReverse: (acc[group]?.metrics?.bytesReverse || 0) + (edge.metrics.bytesReverse || 0),
          byteRateReverse: (acc[group]?.metrics?.byteRateReverse || 0) + (edge.metrics.byteRateReverse || 0),
          latencyReverse: (acc[group]?.metrics?.latencyReverse || 0) + (edge.metrics.latencyReverse || 0)
        };
      }

      return acc;
    },
    {} as { [key: string]: GraphEdge }
  );

  // Convert the mapping to an array of edges
  return Object.values(edgeMap);
}
