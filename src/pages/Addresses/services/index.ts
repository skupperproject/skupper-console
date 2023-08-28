import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '@core/components/SKSanckeyChart';
import { PrometheusApiSingleResult } from 'API/Prometheus.interfaces';
import { AddressResponse } from 'API/REST.interfaces';
import { VarColors } from 'colors';

export const AddressesController = {
  extendAddressesWithActiveAndTotalFlowPairs: (
    services: AddressResponse[],
    {
      httpTotalFlows,
      tcpTotalFlows,
      tcpActiveFlows
    }: {
      httpTotalFlows?: PrometheusApiSingleResult[];
      tcpTotalFlows?: PrometheusApiSingleResult[];
      tcpActiveFlows?: PrometheusApiSingleResult[];
    }
  ) => {
    const tcpActiveFlowsMap =
      tcpActiveFlows?.length &&
      tcpActiveFlows.reduce(
        (acc, flow) => {
          acc[flow.metric.address] = Number(flow.value[1]) / 2;

          return acc;
        },
        {} as Record<string, number>
      );

    const tcpTotalFlowsMap =
      tcpTotalFlows?.length &&
      tcpTotalFlows?.reduce(
        (acc, flow) => {
          acc[flow.metric.address] = Number(flow.value[1]) / 2;

          return acc;
        },
        {} as Record<string, number>
      );

    const httpTotalFlowsMap =
      httpTotalFlows?.length &&
      httpTotalFlows?.reduce(
        (acc, flow) => {
          acc[flow.metric.address] = Number(flow.value[1]) / 2;

          return acc;
        },
        {} as Record<string, number>
      );

    const totalFlowMap = { ...tcpTotalFlowsMap, ...httpTotalFlowsMap };

    return services.map((service) => ({
      ...service,
      totalFlows: totalFlowMap && totalFlowMap[service.name] ? Math.round(totalFlowMap[service.name]) : 0,
      currentFlows:
        tcpActiveFlowsMap && tcpActiveFlowsMap[service.name] ? Math.round(tcpActiveFlowsMap[service.name]) : 0
    }));
  },

  convertToSankeyChartData: (servicePairs: PrometheusApiSingleResult[], withMetric = false) => {
    const separator = '@_@'; // This is an internal team role to unify asiteId and a siteName in prometheus
    const sourceProcessSuffix = 'client'; // The Sankey chart crashes when the same site is present in both the client and server positions. No circular dependency are allowed for this kind of chart

    const clients =
      servicePairs?.map(({ metric }) => ({
        id: `${metric.sourceProcess || metric.sourceSite?.split(separator)[0]} ${sourceProcessSuffix}`,
        nodeColor: metric.sourceProcess ? VarColors.Blue400 : undefined
      })) || [];

    const servers =
      servicePairs?.map(({ metric }) => ({
        id: metric.destProcess || metric.destSite?.split(separator)[0],
        nodeColor: metric.destProcess ? VarColors.Blue400 : undefined
      })) || [];

    const nodes = [...clients, ...servers].filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);

    const links =
      servicePairs?.map(({ metric, value }) => ({
        source: `${metric.sourceProcess || metric.sourceSite?.split(separator)[0]} ${sourceProcessSuffix}`,
        target: metric.destProcess || metric.destSite?.split(separator)[0],
        value: withMetric ? Number(value[1]) : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
      })) || [];

    return { nodes, links };
  }
};
