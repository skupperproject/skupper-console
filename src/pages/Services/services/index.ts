import { VarColors } from '../../../config/colors';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../../../core/components/SKSanckeyChart/SkSankey.constants';
import { removeDuplicatesFromArrayOfObjects } from '../../../core/utils/removeDuplicatesFromArrayOfObjects';
import { GraphEdge, GraphElementNames, GraphIconKeys, GraphNode } from '../../../types/Graph.interfaces';
import { SkSankeyChartNode } from '../../../types/SkSankeyChart.interfaces';

export const ServicesController = {
  convertPairsToSankeyChartData: (
    servicePairs: {
      sourceName: string;
      sourceSiteName?: string;
      destinationName: string;
      destinationSiteName?: string;
      byteRate?: number;
      color?: string;
    }[],
    showMetrics: boolean
  ) => {
    const sourceProcessSuffix = 'client';

    // Generate nodes and links
    const nodes = generateSankeyNodes(servicePairs, sourceProcessSuffix);
    const links = generateSankeyLinks(servicePairs, sourceProcessSuffix, showMetrics);

    return { nodes, links };
  },

  convertPairsTopologyData: (
    servicePairs: {
      sourceId: string;
      sourceName: string;
      destinationId: string;
      destinationName: string;
      byteRate?: number;
      color?: string;
      iconName: GraphIconKeys;
      type: GraphElementNames;
    }[]
  ): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    const generateTopologyNodes = (pairs: typeof servicePairs) => {
      const clients = pairs.map(({ type, iconName, sourceId, sourceName }) => ({
        type,
        id: sourceId,
        name: sourceName,
        label: sourceName,
        iconName
      }));

      const servers = pairs.map(({ destinationId, destinationName }) => ({
        id: destinationId,
        name: destinationName,
        label: destinationName,
        type: 'SkEmptyNode' as GraphElementNames,
        iconName: 'process' as GraphIconKeys
      }));

      return removeDuplicates([...clients, ...servers], 'id');
    };

    const generateTopologyEdges = (pairs: typeof servicePairs) =>
      pairs
        .map(({ sourceId, sourceName, destinationId, destinationName }) => ({
          type: 'SkListenerConnectorEdge' as GraphElementNames,
          id: `${sourceId}-${destinationId}`,
          source: sourceId,
          sourceName,
          target: destinationId,
          targetName: destinationName
        }))
        .filter(({ source, target }) => source && target);

    // Generate nodes and edges
    const nodes = generateTopologyNodes(servicePairs);
    const edges = generateTopologyEdges(servicePairs);

    return { nodes, edges };
  }
};

/**
 * Removes duplicate objects from an array based on a given key.
 */
const removeDuplicates = <T>(items: T[], key: keyof T): T[] =>
  items.filter((item, index, array) => array.findIndex((v) => v[key] === item[key]) === index);

/**
 * Generates Sankey nodes based on source and destination data.
 */
const generateSankeyNodes = (
  servicePairs: {
    sourceName: string;
    sourceSiteName?: string;
    destinationName: string;
    destinationSiteName?: string;
    color?: string;
  }[],
  sourceProcessSuffix: string
): SkSankeyChartNode[] => {
  const clients = servicePairs.map(({ sourceName, sourceSiteName, destinationName, color = VarColors.Blue400 }) => ({
    id: sourceName === destinationName ? `${sourceName} ${sourceProcessSuffix}` : sourceName,
    nodeColor: sourceSiteName ? VarColors.Black400 : color
  }));

  const servers = servicePairs.map(({ destinationName, destinationSiteName, color = VarColors.Blue400 }) => ({
    id: destinationName,
    nodeColor: destinationSiteName ? VarColors.Black400 : color
  }));

  return removeDuplicates([...clients, ...servers], 'id');
};

/**
 * Generates Sankey links based on service pairs.
 */
const generateSankeyLinks = (
  servicePairs: {
    sourceName: string;
    destinationName: string;
    byteRate?: number;
  }[],
  sourceProcessSuffix: string,
  showMetrics: boolean
) =>
  removeDuplicatesFromArrayOfObjects(
    servicePairs
      .map(({ sourceName, destinationName, byteRate }) => ({
        source: sourceName === destinationName ? `${sourceName} ${sourceProcessSuffix}` : sourceName,
        target: destinationName,
        value: showMetrics ? byteRate || DEFAULT_SANKEY_CHART_FLOW_VALUE : DEFAULT_SANKEY_CHART_FLOW_VALUE
      }))
      .filter(({ source, target }) => source && target)
  );
