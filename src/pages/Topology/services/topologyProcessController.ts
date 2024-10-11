import { Role } from '@API/REST.enum';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { ProcessPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';
import { TopologyMetrics } from '@sk-types/Topology.interfaces';
import { GraphEdge, GraphNode } from 'types/Graph.interfaces';

import { shape } from '../Topology.constants';

import { TopologyController, groupEdges, groupNodes } from '.';

interface TopologyProcessControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  processes: ProcessResponse[];
  processesPairs: ProcessPairsResponse[];
  metrics: TopologyMetrics | null;
  serviceIdsSelected?: string[];
  options: {
    showLinkBytes: boolean;
    showLinkByteRate: boolean;
    showLinkLatency: boolean;
    showLinkProtocol: boolean;
    showDeployments: boolean;
    showInboundMetrics: boolean;
    showMetricDistribution: boolean;
    showMetricValue: boolean;
  };
}

const convertProcessesToNodes = (processes: ProcessResponse[]): GraphNode[] =>
  processes?.map(
    ({
      identity,
      name: label,
      parent: combo,
      parentName: comboName,
      groupIdentity,
      groupName,
      processRole: role,
      processBinding
    }) => ({
      type: shape[role === Role.Remote ? role : processBinding],
      id: identity,
      label,
      iconName: role === Role.Internal ? 'skupper' : 'process',
      combo,
      comboName,
      groupId: groupIdentity,
      groupName
    })
  );

export const TopologyProcessController = {
  dataTransformer: ({
    idsSelected,
    searchText,
    processes,
    processesPairs,
    metrics,
    serviceIdsSelected,
    options
  }: TopologyProcessControllerProps) => {
    let pPairs = processesPairs;
    let p = processes;

    // a process can be filered by services
    if (serviceIdsSelected) {
      const serverIds = p
        // the format of one address is  serviceName@seviceId@protocol
        .filter(({ addresses }) =>
          addresses?.map((address) => address.split('@')[1]).some((address) => serviceIdsSelected.includes(address))
        )
        .map(({ identity }) => identity);

      pPairs = pPairs.filter((pair) => serverIds.includes(pair.destinationId));

      const processIdsFromService = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      p = p.filter(({ identity }) => processIdsFromService.includes(identity));
    }

    const protocolByProcessPairsMap = (processesPairs || []).reduce(
      (acc, { sourceId, destinationId, observedApplicationProtocols }) => {
        acc[`${sourceId}${destinationId}`] = observedApplicationProtocols || '';

        return acc;
      },
      {} as Record<string, string>
    );

    let processNodes = convertProcessesToNodes(p);
    let processPairEdges = TopologyController.addMetricsToEdges(
      TopologyController.convertPairsToEdges(pPairs, 'SkDataEdge'),
      PrometheusLabelsV2.SourceProcessName,
      PrometheusLabelsV2.DestProcessName,
      protocolByProcessPairsMap,
      metrics
    );

    if (options.showDeployments) {
      processNodes = groupNodes(processNodes);
      processPairEdges = groupEdges(processNodes, processPairEdges);
    }

    return {
      // when the id selected comes from an other view the id is a single node/edge but if the topology has the option showDeployments == true, this id can be part of grouped edge/node.
      // In that case, we need to find the node/edge group where the single node is contained
      nodeIdSelected: findMatched(processNodes, idsSelected) || findMatched(processPairEdges, idsSelected),
      nodeIdsToHighLight: TopologyController.nodesToHighlight(processNodes, searchText),
      nodes: processNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdsSelected?.length ? `${node.id}-${serviceIdsSelected}` : node.id
      })),
      edges: TopologyController.addLabelToEdges(processPairEdges, options),
      combos: TopologyController.getCombosFromNodes(processNodes)
    };
  }
};

// Function to find the matched node/edge based on the first node in idsSelected
function findMatched(processNodes: GraphNode[] | GraphEdge[], idsSelected?: string[]) {
  if (!idsSelected?.length) {
    return undefined;
  }

  const nodeIdSelectedArray = idsSelected[0].split('~');

  const processNode = processNodes.find(({ id }) => {
    const nodeIds = id.split('~');
    const nodeIdSet = new Set(nodeIds);

    return nodeIdSelectedArray.every((nodeId) => nodeIdSet.has(nodeId));
  });

  return processNode?.id;
}
