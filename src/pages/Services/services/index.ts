import { VarColors } from '../../../config/colors';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../../../core/components/SKSanckeyChart/SkSankey.constants';
import { removeDuplicatesFromArrayOfObjects } from '../../../core/utils/removeDuplicatesFromArrayOfObjects';
import { GraphCombo, GraphEdge, GraphElementNames, GraphIconKeys, GraphNode } from '../../../types/Graph.interfaces';
import { ConnectorResponse, ListenerResponse } from '../../../types/REST.interfaces';
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

  mapListenersToRoutingKey: (listeners: ListenerResponse[]) =>
    listeners.map((item) => ({
      sourceId: item.identity,
      sourceName: item.name,
      siteId: `${item.siteId}-listener`, // Avoids including connectors and processes in the combo
      siteName: item.siteName,
      destinationId: item.addressId,
      destinationName: item.address,
      type: 'SkEmptyNode' as GraphElementNames,
      iconName: 'listener' as GraphIconKeys
    })),

  mapConnectorsToProcesses: (connectors: ConnectorResponse[]) =>
    connectors.map((item) => ({
      sourceId: `${getBaseName(item.name)}-${item.siteId}-${item.destPort}`,
      sourceName: `${getBaseName(item.name)}:${item.destPort}`,
      siteId: item.siteId,
      siteName: item.siteName,
      destinationId: item.processId,
      destinationName: `${item.target}`,
      type: 'SkEmptyNode' as GraphElementNames,
      iconName: 'connector' as GraphIconKeys
    })),

  mapRoutingKeyToAggregatedConnectors: (aggregatedConnectors: ConnectorResponse[], id: string, name: string) =>
    aggregatedConnectors.length
      ? aggregatedConnectors.map((item) => ({
          sourceId: item.addressId,
          sourceName: item.address,
          destinationId: `${item.name}-${item.siteId}-${item.destPort}`,
          destinationName: `${item.name}:${item.destPort}`,
          type: 'SkEmptyNode' as GraphElementNames,
          iconName: 'routingKey' as GraphIconKeys
        }))
      : [
          {
            sourceId: id,
            sourceName: name,
            destinationId: ``,
            destinationName: ``,
            type: 'SkEmptyNode' as GraphElementNames,
            iconName: 'routingKey' as GraphIconKeys
          }
        ],

  convertPairsTopologyData: (
    servicePairs: {
      sourceId: string;
      sourceName: string;
      siteId?: string;
      siteName?: string;
      destinationId: string;
      destinationName: string;
      byteRate?: number;
      color?: string;
      iconName: GraphIconKeys;
      type: GraphElementNames;
    }[]
  ): { nodes: GraphNode[]; edges: GraphEdge[]; combos: GraphCombo[] } => {
    const generateTopologyNodes = (pairs: typeof servicePairs) => {
      const clients = pairs.map(({ type, iconName, sourceId, sourceName, siteId }) => ({
        type,
        id: sourceId,
        name: sourceName,
        label: sourceName,
        iconName,
        combo: siteId
      }));

      const servers = pairs.map(({ destinationId, destinationName, siteId }) => ({
        id: destinationId,
        name: destinationName,
        label: destinationName,
        type: 'SkEmptyNode' as GraphElementNames,
        iconName: 'process' as GraphIconKeys,
        combo: siteId
      }));

      return removeDuplicates([...clients, ...servers], 'id').filter(({ id }) => id);
    };

    const generateTopologyEdges = (pairs: typeof servicePairs) => {
      const links = pairs
        .map(({ sourceId, sourceName, destinationId, destinationName }) => ({
          type: 'SkListenerConnectorEdge' as GraphElementNames,
          id: `${sourceId}-${destinationId}`,
          source: sourceId,
          sourceName,
          target: destinationId,
          targetName: destinationName
        }))
        .filter(({ source, target }) => source && target);

      return removeDuplicates(links, 'id');
    };

    const generateTopologyCombos = (pairs: typeof servicePairs) => {
      const combos = pairs
        .map(({ siteId, siteName }) => ({
          type: 'SkCombo' as GraphElementNames,
          id: siteId || '',
          label: siteName || ''
        }))
        .filter(({ id }) => id);

      return removeDuplicates(combos, 'id');
    };

    // Generate nodes and edges
    const nodes = generateTopologyNodes(servicePairs);
    const edges = generateTopologyEdges(servicePairs);
    const combos = generateTopologyCombos(servicePairs);

    return { nodes, edges, combos };
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

function getBaseName(name: string): string {
  const ipSuffixRegex = /-\d{1,3}(\.\d{1,3}){3}$/;

  return name.replace(ipSuffixRegex, '');
}

// Utility function for aggregating connector responses
export function aggregateConnectorResponses(connectors: ConnectorResponse[]) {
  const aggregatedResults: Record<string, ConnectorResponse> = {};

  connectors.forEach((connector) => {
    const baseName = getBaseName(connector.name);
    const key = `${connector.parent}-${baseName}`;

    if (!aggregatedResults[key]) {
      aggregatedResults[key] = { ...connector, name: baseName, count: 1, processes: [connector] };
    } else {
      aggregatedResults[key].count!++;
      aggregatedResults[key].processes!.push(connector);
    }
  });

  return Object.values(aggregatedResults);
}
