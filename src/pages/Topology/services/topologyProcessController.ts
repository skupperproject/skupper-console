import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import processIcon from '@assets/process.svg';
import skupperIcon from '@assets/skupper.svg';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';

import { shape } from '../Topology.constants';
import { TopologyMetrics } from '../Topology.interfaces';

import { TopologyController, convertEntityToNode, groupEdges, groupNodes } from '.';

interface TopologyProcessControllerProps {
  idsSelected: string[] | undefined;
  processes: ProcessResponse[];
  processesPairs: ProcessPairsResponse[];
  metrics: TopologyMetrics | null;
  serviceIdsSelected?: string[];
  options: {
    showLinkBytes: boolean;
    showLinkByteRate: boolean;
    showLinkLatency: boolean;
    showLinkLabelReverse: boolean;
    showLinkProtocol: boolean;
    showDeployments: boolean;
  };
}

const addProcessMetricsToEdges = (
  edges: GraphEdge[],
  metrics: TopologyMetrics | null,
  protocolByProcessPairsMap: Record<string, string>
) =>
  TopologyController.addMetricsToEdges(
    edges,
    'sourceProcess',
    'destProcess',
    protocolByProcessPairsMap,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
  );

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
    }) => {
      const iconSrc = role === 'internal' ? skupperIcon : processIcon;
      const type = shape[role === 'remote' ? role : processBinding];

      return convertEntityToNode({
        id: identity,
        combo,
        comboName,
        label,
        iconSrc,
        type,
        groupId: groupIdentity,
        groupName
      });
    }
  );

export const TopologyProcessController = {
  dataTransformer: ({
    idsSelected,
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
      (acc, { sourceId, destinationId, protocol }) => {
        acc[`${sourceId}${destinationId}`] = protocol || '';

        return acc;
      },
      {} as Record<string, string>
    );

    let processNodes = convertProcessesToNodes(p);
    let processPairEdges = addProcessMetricsToEdges(
      TopologyController.convertPairsToEdges(pPairs),
      metrics,
      protocolByProcessPairsMap
    );

    if (options.showDeployments) {
      processNodes = groupNodes(processNodes);
      processPairEdges = groupEdges(processNodes, processPairEdges);
    }

    return {
      // when the id selected comes from an other view the id is a single node but maybe this page has the option showDeployments == true.
      // In that case we need to find the processNode with ids aggregated where the single node is contained
      nodeIdSelected: findMatchedNode(processNodes, idsSelected),
      nodes: processNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdsSelected?.length ? `${node.id}-${serviceIdsSelected}` : node.id
      })),
      edges: TopologyController.configureEdges(processPairEdges, options),
      combos: TopologyController.getCombosFromNodes(processNodes)
    };
  }
};

// Function to find the matched node based on the first node in idsSelected
function findMatchedNode(processNodes: GraphNode[], idsSelected?: string[]) {
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
