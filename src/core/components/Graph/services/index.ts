import { ComboData, EdgeData, NodeData } from '@antv/g6';

import { graphIconsMap } from '../Graph.config';
import {
  GraphCombo,
  GraphEdge,
  GraphNode,
  LocalStorageData,
  LocalStorageDataSaved,
  LocalStorageDataSavedPayload
} from '../Graph.interfaces';

const prefixLocalStorageItem = 'skupper';
const GRAPH_CONTAINER_ID = 'container';

export const GraphController = {
  saveAllNodePositions: (nodes: LocalStorageData[]) => {
    const savedNodePositionsMap = JSON.parse(
      localStorage.getItem(prefixLocalStorageItem) || '{}'
    ) as LocalStorageDataSaved;

    const nodePositionsMap = nodes.reduce((acc, { id, x, y }) => {
      acc[id] = { x, y };

      return acc;
    }, {} as LocalStorageDataSaved);

    const result = { ...savedNodePositionsMap };

    for (const key in nodePositionsMap) {
      if (key in result) {
        delete result[key];
      }
    }

    Promise.resolve(localStorage.setItem(prefixLocalStorageItem, JSON.stringify({ ...result, ...nodePositionsMap })));
  },

  removeAllNodePositionsFromLocalStorage() {
    localStorage.removeItem(prefixLocalStorageItem);
  },

  cleanControlsFromLocalStorage(suffix: string) {
    Object.keys(localStorage)
      .filter((x) => x.endsWith(suffix))
      .forEach((x) => localStorage.removeItem(x));
  },

  fromNodesToLocalStorageData(nodes: NodeData[], setLocalStorageData: Function) {
    return nodes
      .map((node) => {
        const { id } = node;
        const { persistPositionKey } = node.data as Record<string, number>;
        const { x, y } = node.style as Record<string, number>;

        if (id && x !== undefined && y !== undefined) {
          return setLocalStorageData({ id: persistPositionKey || id, x, y });
        }

        return undefined;
      })
      .filter(Boolean) as LocalStorageData[];
  },

  calculateNumberOfGroupedNodes(nodes: GraphNode[]) {
    const counts = nodes.reduce(
      (acc, node) => {
        acc[node.combo || ''] = (acc[node.combo || ''] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>
    );

    const max = Math.max(...Object.values(counts), 25);
    const sideLength = Math.floor(Math.sqrt(max));

    return sideLength;
  },

  addPositionsToNodes(nodesWithoutPosition: GraphNode[], nodesWithPositions: NodeData[] = []): GraphNode[] {
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');

    const nodesWithCachedPosition = nodesWithoutPosition.map((node) => {
      const positions = cache[node.persistPositionKey || node.id] as LocalStorageDataSavedPayload | undefined;

      const x = positions ? positions.x : undefined;
      const y = positions ? positions.y : undefined;

      return { ...node, x, y };
    });

    //Map of the most updated nodes from the graph
    const positionMap = nodesWithPositions?.reduce(
      (acc, node) => {
        const { x, y } = node.style as Record<string, number>;
        const { persistPositionKey } = node.data as Record<string, number>;

        const id = persistPositionKey || node.id;
        acc[id] = { x, y };

        return acc;
      },
      {} as Record<string, { x?: number; y?: number }>
    );

    // check updated nodes from the graph otherwise rollback to the localstorage position
    const nodes = nodesWithCachedPosition.map((node) => ({
      ...node,
      x: positionMap[node.persistPositionKey || node.id]?.x || node.x,
      y: positionMap[node.persistPositionKey || node.id]?.y || node.y
    }));

    return nodes;
  },

  cleanAllLocalNodePositions(nodes: NodeData[], shouldRemoveFixedPosition: boolean = false) {
    nodes.map((node) => {
      if (node.style) {
        node.style.x = undefined;
        node.style.y = undefined;
      }
      if (node.data) {
        if (shouldRemoveFixedPosition) {
          node.data.fx = undefined;
          node.data.fy = undefined;
        }
      }
    });
  },

  transformData: ({
    nodes,
    edges,
    combos
  }: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    combos?: GraphCombo[];
  }): {
    nodes: NodeData[];
    edges: EdgeData[];
    combos?: ComboData[];
  } => {
    const transformedEdges = markPairs(addCountUsageSource(sanitizeEdges(nodes, edges))) as (GraphEdge & {
      usageCount: number;
      hasPair: boolean;
      isSame: boolean;
    })[];
    // Match the combo of the node with the existing combos
    const comboIds = combos?.map(({ id }) => id);

    // calculate the visual distribution of the metrics
    const edgeMetrics = transformedEdges.map(({ metricValue, source, target }) =>
      // remove metrics within the same site
      source === target ? 0 : metricValue || 0
    );
    const maxMetricValue = Math.max(...edgeMetrics);
    const minMetricValue = Math.min(...edgeMetrics.filter((metric) => metric)) || 0;

    return {
      nodes: nodes
        .sort(sortNodesByCombo)
        .map(({ id, combo, label, iconSrc, type = 'SkNode', groupedNodeCount, x, y, ...data }) => ({
          id,
          combo: combo && comboIds?.includes(combo) ? combo : undefined,
          type,
          data: {
            ...data,
            fullLabelText: label,
            partialLabelText: ellipsisInTheMiddle(label),
            cluster: combo,
            fx: x,
            fy: y
          },
          style: {
            x,
            y,
            labelText: ellipsisInTheMiddle(label),
            iconSrc: graphIconsMap[iconSrc],
            badge: groupedNodeCount !== undefined,
            badges: [
              {
                text: groupedNodeCount ? groupedNodeCount?.toString() : '',
                placement: 'right-top'
              }
            ]
          }
        })),

      edges: transformedEdges.map(
        ({
          id,
          source,
          target,
          label,
          isSame,
          hasPair,
          type = 'SkSiteDataEdge',
          metricValue,
          protocolLabel,
          ...data
        }) => ({
          id,
          source,
          target,
          type: isSame ? 'SkLoopEdge' : hasPair && type !== 'SkSiteEdge' ? 'SkSiteDataEdge' : type,
          data,
          style: {
            halo: true,
            haloLineWidth: !isSame
              ? normalizeBitrateToLineThickness(metricValue as number, minMetricValue, maxMetricValue)
              : 0,
            badgeText: protocolLabel,
            label: !!label,
            labelText: label,
            curveOffset: hasPair ? 30 : 0 // (usageCount - 1) * 15
          }
        })
      ),

      combos: combos?.map(({ id, label, type = 'SkCombo' }) => ({
        id,
        type,
        style: {
          labelText: label
        }
      }))
    };
  },

  getParent: (): Element => document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element,
  getParentName: () => GRAPH_CONTAINER_ID
};

// TODO: remove this function when Backend sanitize the old process pairs
function sanitizeEdges(nodes: GraphNode[], edges: GraphEdge[]) {
  const availableNodesMap = nodes.reduce(
    (acc, node) => {
      acc[node.id] = node.id;

      return acc;
    },
    {} as Record<string, string>
  );

  return edges.filter(({ source, target }) => availableNodesMap[source] && availableNodesMap[target]);
}

// usageCount controls the curve of edges with the same source
function addCountUsageSource(edges: GraphEdge[]) {
  const sourceUsageCount = new Map<string, number>();

  return edges.map((edge) => {
    const { source } = edge;
    sourceUsageCount.set(source, (sourceUsageCount.get(source) || 0) + 1);

    return { ...edge, usageCount: sourceUsageCount.get(source) || 0 };
  });
}

// Identify edges that have a bidirectional direction
function markPairs(data: GraphEdge[]) {
  const set = new Set(data.map((item) => `${item.source}-${item.target}`));

  return data.map((item) => {
    const reversePair = `${item.target}-${item.source}`;
    const hasPair = set.has(reversePair);
    const isSame = item.source === item.target;

    return {
      ...item,
      hasPair,
      isSame
    };
  });
}

function ellipsisInTheMiddle(str: string) {
  const maxLength = 20;
  const leftPartLength = 15;
  const rightPartLength = 5;

  if (str.length <= maxLength) {
    return str;
  }

  const leftPart = str.substring(0, leftPartLength);
  const rightPart = str.substring(str.length - rightPartLength);

  return `${leftPart}...${rightPart}`;
}

/**
 * Normalizes a given metric value (such as bitrate) to a line thickness value
 * for visual representations like graphs or charts. The normalization is done
 * within a specified range, and the result is adjusted to fit within a maximum
 * line thickness. An optional power parameter allows for adjusting the scaling curve.
 */
function normalizeBitrateToLineThickness(
  value: number,
  minMetricValue: number,
  maxMetricValue: number,
  maxLineThickness = 30, // The maximum possible thickness of the line. Default is 30.
  power = 0.35 //The exponent used for scaling, affecting the curve of normalization. Default is 0.35.
) {
  const minMetricValueSanitized = maxMetricValue - minMetricValue !== 0 ? minMetricValue : 0.1;

  const range = maxMetricValue - (minMetricValueSanitized === Infinity ? 0 : 1);

  const normalizedValue =
    Math.pow((value - (minMetricValueSanitized === Infinity ? 0 : minMetricValueSanitized)) / range, power) *
    maxLineThickness;
  const lineThickness = Math.max(Math.ceil(normalizedValue), 0.5);

  return lineThickness;
}

function sortNodesByCombo(a: GraphNode, b: GraphNode): number {
  return (a.combo || '')?.localeCompare(b.combo || '') || 0;
}
