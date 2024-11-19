import { VarColors } from '../../../config/colors';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '../../../core/components/SKSanckeyChart/SkSankey.constants';
import { removeDuplicatesFromArrayOfObjects } from '../../../core/utils/removeDuplicatesFromArrayOfObjects';
import { GraphEdge, GraphElementNames, GraphIconKeys, GraphNode } from '../../../types/Graph.interfaces';
import { PrometheusMetric } from '../../../types/Prometheus.interfaces';
import { ServiceResponse } from '../../../types/REST.interfaces';
import { SkSankeyChartLink, SkSankeyChartNode } from '../../../types/SkSankeyChart.interfaces';

export const ServicesController = {
  extendServicesWithOpenAndTotalConnections: (
    services: ServiceResponse[],
    {
      tcpActiveFlows
    }: {
      tcpActiveFlows?: PrometheusMetric<'vector'>[];
    }
  ) => {
    const tcpOpenConnectionsMap =
      tcpActiveFlows?.length &&
      tcpActiveFlows.reduce(
        (acc, flow) => {
          acc[flow.metric[PrometheusLabelsV2.RoutingKey]] = Number(flow.value[1]);

          return acc;
        },
        {} as Record<string, number>
      );

    return services.map((service) => ({
      ...service,
      currentFlows:
        tcpOpenConnectionsMap && tcpOpenConnectionsMap[service.name]
          ? Math.round(tcpOpenConnectionsMap[service.name])
          : ''
    }));
  },

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
    const sourceProcessSuffix = 'client'; // The Sankey chart crashes when the same site is present in both the client and server positions. No circular dependency are allowed for this kind of chart
    const clients: SkSankeyChartNode[] =
      servicePairs?.map(({ sourceName, sourceSiteName, destinationName, color = VarColors.Blue400 }) => ({
        id: sourceName === destinationName ? `${sourceName} ${sourceProcessSuffix}` : sourceName,
        nodeColor: sourceSiteName ? VarColors.Black400 : color
      })) || [];

    const servers =
      servicePairs?.map(({ destinationName, destinationSiteName, color = VarColors.Blue400 }) => ({
        id: destinationName || destinationSiteName,
        nodeColor: destinationSiteName ? VarColors.Black400 : color
      })) || [];

    const nodes = [...clients, ...servers]
      .filter(({ id }) => id)
      .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i) as SkSankeyChartNode[];

    const links =
      (servicePairs
        .map(({ sourceName, destinationName, byteRate }) => ({
          source: sourceName === destinationName ? `${sourceName} ${sourceProcessSuffix}` : sourceName,
          target: destinationName,
          value: showMetrics ? byteRate || DEFAULT_SANKEY_CHART_FLOW_VALUE : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
        }))
        .filter(({ source, target }) => source && target) as SkSankeyChartLink[]) || [];

    return { nodes, links: removeDuplicatesFromArrayOfObjects(links) };
  },

  convertPairsToListenerConnectorsTopologyData: (
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
    const clients =
      servicePairs?.map(({ type, iconName, sourceId, sourceName }) => ({
        type,
        id: sourceId,
        name: sourceName,
        label: sourceName,
        iconName
      })) || [];

    const servers =
      servicePairs?.map(({ destinationId, destinationName }) => ({
        id: destinationId,
        name: destinationName,
        label: destinationName,
        type: 'SkEmptyNode' as GraphElementNames,
        iconName: 'process' as GraphIconKeys
      })) || [];

    const nodes = [...clients, ...servers]
      .filter(({ id }) => id)
      .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);

    const edges =
      servicePairs
        .map(({ sourceId, sourceName, destinationId, destinationName }) => ({
          type: 'SkListenerConnectorEdge' as GraphElementNames,
          id: `${sourceId}-${destinationId}`,
          source: sourceId,
          sourceName,
          target: destinationId,
          targetName: destinationName
          // value: showMetrics ? byteRate || DEFAULT_SANKEY_CHART_FLOW_VALUE : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
        }))
        .filter(({ source, target }) => source && target) || [];

    return { nodes, edges };
  }
};
