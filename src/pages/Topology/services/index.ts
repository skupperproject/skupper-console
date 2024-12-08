import { GraphEdge, GraphCombo, GraphNode, GraphElementNames } from 'types/Graph.interfaces';

import { PrometheusApi } from '../../../API/Prometheus.api';
import { Direction } from '../../../API/REST.enum';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { formatByteRate, formatBytes } from '../../../core/utils/formatBytes';
import { removeDuplicatesFromArrayOfObjects } from '../../../core/utils/removeDuplicatesFromArrayOfObjects';
import { PrometheusMetric } from '../../../types/Prometheus.interfaces';
import { ProcessPairsResponse, PairsResponse } from '../../../types/REST.interfaces';
import {
  TopologyMetrics,
  TopologyConfigMetrics,
  TopologyShowOptionsSelected,
  TopologyConfigMetricsParams
} from '../../../types/Topology.interfaces';
import { shape } from '../Topology.constants';

const IDS_GROUP_SEPARATOR = '~';
const IDS_MULTIPLE_SELECTION_SEPARATOR = ',';
const PAIR_SEPARATOR = 'processpair-';

export const TopologyController = {
  getCombosFromNodes: (nodes: GraphNode[]): GraphCombo[] => {
    const idLabelPairs = nodes
      // TODO: remove when backend sanitize combo = '' and comboname = 'unknown'
      .filter(({ combo }) => combo)
      .map(({ combo, comboName }) => ({
        type: 'SkCombo' as GraphElementNames,
        id: combo || '',
        label: comboName || ''
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // TODO: BE-bug: The API occasionally returns processes without a siteName for a site.
    // While in some cases, using the hostname as a substitute is acceptable, it can lead to conflicts.
    // This inconsistency results in situations where the hostname and siteName differ but share the same ID.
    const uniqueNodes: GraphCombo[] = [...new Map(idLabelPairs.map((item) => [item.id, item])).values()];

    return removeDuplicatesFromArrayOfObjects(uniqueNodes);
  },

  convertPairToEdge: (
    { identity, sourceId, destinationId, sourceName, destinationName }: PairsResponse,
    type: GraphElementNames
  ): GraphEdge => ({
    type,
    id: identity,
    source: sourceId,
    target: destinationId,
    sourceName,
    targetName: destinationName
  }),

  convertPairsToEdges: (
    processesPairs: ProcessPairsResponse[] | PairsResponse[],
    type: GraphElementNames
  ): GraphEdge[] => processesPairs.map((pair) => TopologyController.convertPairToEdge(pair, type)),

  getAllTopologyMetrics: async ({
    showBytes = false,
    showByteRate = false,
    showLatency = false,
    metricQueryParams
  }: TopologyConfigMetrics): Promise<TopologyMetrics> => {
    try {
      // Fetch metrics based on the provided flags
      const [sourceToDestBytes, destToSourceBytes, sourceToDestByteRate, destToSourceByteRate, latencyByProcessPairs] =
        await Promise.all([
          fetchBytesMetrics(showBytes, metricQueryParams),
          fetchBytesMetrics(showBytes, metricQueryParams, true),
          fetchByteRateMetrics(showByteRate, metricQueryParams),
          fetchByteRateMetrics(showByteRate, metricQueryParams, true),
          fetchLatencyMetrics(showLatency, metricQueryParams)
        ]);

      // Return the collected metrics
      return {
        sourceToDestBytes,
        destToSourceBytes,
        sourceToDestByteRate,
        destToSourceByteRate,
        latencyByProcessPairs
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  addMetricsToEdges: (
    edges: GraphEdge[],
    metricSourceLabel: PrometheusLabelsV2, // Prometheus metric label to compare with the metricDestLabel
    metricDestLabel: PrometheusLabelsV2,
    metrics?: TopologyMetrics | null
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

    const sourceToDestBytesMap = getPairsMap(metrics?.sourceToDestBytes);
    const destToSourceBytesMap = getPairsMap(metrics?.destToSourceBytes);
    const sourceToDestByteRateMap = getPairsMap(metrics?.sourceToDestByteRate);
    const destToSourceByteRateMap = getPairsMap(metrics?.destToSourceByteRate);

    // Incoming metrics indicate that the source is the client and the destination is the server. In our case, the edges have a direction from client to server
    const latencyByPairsMapIn = getPairsMap(
      metrics?.latencyByProcessPairs?.filter((pair) => pair.metric.direction === Direction.Incoming)
    );

    // Outgoing metrics indicate that the source is the server and the destination is the client. It is used to determine the reverse metric
    const latencyByPairsMapOut = getPairsMap(
      metrics?.latencyByProcessPairs?.filter((pair) => pair.metric.direction === Direction.Outgoing)
    );

    return edges.map((edge) => {
      const pairKey = `${edge.sourceName}${edge.targetName}`;
      const inversePairKey = `${edge.targetName}${edge.sourceName}`;

      return {
        ...edge,
        metrics: {
          bytes: sourceToDestBytesMap[pairKey],
          byteRate: sourceToDestByteRateMap[pairKey],
          latency: latencyByPairsMapIn[pairKey],
          bytesReverse: destToSourceBytesMap[pairKey],
          byteRateReverse: destToSourceByteRateMap[pairKey],
          latencyReverse: latencyByPairsMapOut[inversePairKey]
        }
      };
    });
  },

  addLabelToEdges: (edges: GraphEdge[], options?: TopologyShowOptionsSelected): GraphEdge[] =>
    edges.map((edge) => {
      const byteRate = options?.showLinkByteRate ? edge?.metrics?.byteRate || 0 : undefined;
      const bytes = options?.showLinkBytes ? edge?.metrics?.bytes || 0 : undefined;

      // The same edge has RX === Tx
      const showRxMetric = !!options?.showInboundMetrics && !(edge.source === edge.target);

      const byteRateRx = showRxMetric && byteRate !== undefined ? edge?.metrics?.byteRateReverse || 0 : undefined;
      const bytesRx = showRxMetric && bytes !== undefined ? edge?.metrics?.bytesReverse || 0 : undefined;

      const metricsString = [
        bytes !== undefined && `${formatBytes(bytes)}`,
        byteRate !== undefined && `${formatByteRate(byteRate)}`
      ]
        .filter(Boolean)
        .join(', ');

      const metricsRxString = [
        bytesRx !== undefined && `(${formatBytes(bytesRx)})`,
        byteRateRx !== undefined && `(${formatByteRate(byteRateRx)})`
      ]
        .filter(Boolean)
        .join(', ');

      const label = options?.showMetricValue ? [metricsString, metricsRxString].filter(Boolean).join('   ') : undefined;

      return {
        ...edge,
        label,
        metricValue: options?.showMetricDistribution ? bytes || byteRate || 0 : undefined
      };
    }),

  loadDisplayOptionsFromLocalStorage(key: string) {
    const displayOptions = localStorage.getItem(key);
    if (displayOptions) {
      return JSON.parse(displayOptions);
    }

    return null;
  },
  transformIdsToStringIds(ids?: string[]) {
    return ids?.join(IDS_MULTIPLE_SELECTION_SEPARATOR);
  },
  transformStringIdsToIds(ids?: string) {
    return ids?.split(IDS_MULTIPLE_SELECTION_SEPARATOR);
  },
  arePairIds(ids?: string) {
    return !!ids?.includes(PAIR_SEPARATOR);
  },
  transformStringGroupIdsToGroupIds(ids?: string) {
    return ids?.split(IDS_GROUP_SEPARATOR);
  },
  areGroupOfIds(ids?: string) {
    return !!ids?.includes(IDS_GROUP_SEPARATOR);
  },
  nodesToHighlight(nodes: GraphNode[], text: string) {
    return nodes.filter((node) => text && node.label.includes(text)).map((node) => node.id);
  }
};

/**
 * Groups an array of GraphNode objects based on their combo and groupId properties.
 */
export function groupNodes(nodes: GraphNode[]): GraphNode[] {
  const groupedNodes: Record<string, GraphNode> = {};

  nodes.forEach((item) => {
    const group = `${item.combo}-${item.groupId}`;

    if (!groupedNodes[group]) {
      groupedNodes[group] = {
        ...item,
        id: '',
        combo: item.combo,
        groupCount: 0,
        type: item.type
      };
    }

    // Collect ids into an array
    const ids = [groupedNodes[group].id, item.id];
    const type = groupedNodes[group].type === shape.bound ? shape.bound : item.type;
    // Use join to concatenate ids with the GROUP_SEPARATOR
    groupedNodes[group].id = ids.filter(Boolean).join(IDS_GROUP_SEPARATOR);
    groupedNodes[group].groupCount! += 1;

    if (groupedNodes[group].groupCount! > 1) {
      groupedNodes[group].label = `${item.groupName}-${item.comboName}`;
      groupedNodes[group].type = type;
      groupedNodes[group].info = { primary: groupedNodes[group].groupCount?.toString() };
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
        acc[group].id += IDS_GROUP_SEPARATOR;
      }

      acc[group].id += edge.id;

      if (edge.metrics) {
        acc[group].metrics = {
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

// Helper function to fetch bytes metrics
const fetchBytesMetrics = async (
  showBytes: boolean,
  metricQueryParams: TopologyConfigMetricsParams,
  isRx = false
): Promise<PrometheusMetric<'vector'>[]> =>
  showBytes
    ? PrometheusApi.fetchAllProcessPairsBytes(metricQueryParams.fetchBytes.groupBy, metricQueryParams.filterBy, isRx)
    : [];

// Helper function to fetch byte rate metrics
const fetchByteRateMetrics = async (
  showByteRate: boolean,
  metricQueryParams: TopologyConfigMetricsParams,
  isRx = false
): Promise<PrometheusMetric<'vector'>[]> =>
  showByteRate
    ? PrometheusApi.fetchAllProcessPairsByteRates(
        metricQueryParams.fetchByteRate.groupBy,
        metricQueryParams.filterBy,
        isRx
      )
    : [];

// Helper function to fetch latency metrics
const fetchLatencyMetrics = async (
  showLatency: boolean,
  metricQueryParams: TopologyConfigMetricsParams
): Promise<PrometheusMetric<'vector'>[]> =>
  showLatency
    ? PrometheusApi.fetchAllProcessPairsLatencies(metricQueryParams.fetchLatency.groupBy, metricQueryParams.filterBy)
    : [];
