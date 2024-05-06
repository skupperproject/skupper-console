import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import processIcon from '@assets/process.svg';
import skupperIcon from '@assets/skupper.svg';
import { MAX_NODE_COUNT_WITHOUT_AGGREGATION } from '@config/config';
import { DEFAULT_REMOTE_NODE_CONFIG } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';

import { shape } from '../Topology.constants';
import { TopologyMetrics } from '../Topology.interfaces';

import { TopologyController, convertEntityToNode, groupEdges, groupNodes } from '.';

interface TopologyProcessControllerProps {
  processes: ProcessResponse[];
  processesPairs: ProcessPairsResponse[];
  metrics: TopologyMetrics | null;
  showLinkLabelReverse: boolean;
  rotateLabel: boolean;
  showSites: boolean;
  showLinkProtocol: boolean;
  serviceIdsSelected?: string[];
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
  );

export const TopologyProcessController = {
  dataTransformer: ({
    processes,
    processesPairs,
    metrics,
    showLinkLabelReverse,
    rotateLabel,
    showSites,
    showLinkProtocol,
    serviceIdsSelected
  }: TopologyProcessControllerProps) => {
    const options = {
      showLinkProtocol,
      showLinkLabelReverse,
      rotateLabel
    };

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

    // Group nodes from the same combo and edges when nodes are > MAX_NODE_COUNT_WITHOUT_AGGREGATION
    if (processNodes.length > MAX_NODE_COUNT_WITHOUT_AGGREGATION) {
      processNodes = groupNodes(processNodes);
      processPairEdges = groupEdges(processNodes, processPairEdges);
    }

    return {
      nodes: processNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdsSelected?.length ? `${node.id}-${serviceIdsSelected}` : node.id
      })),
      edges: TopologyController.configureEdges(processPairEdges, options).map((edge) => ({
        ...edge,
        style: { cursor: 'pointer' } // clickable
      })),
      combos: showSites ? TopologyController.getNodeGroupsFromNodes(processNodes) : []
    };
  }
};
