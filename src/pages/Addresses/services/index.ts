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

  getNodesAndLinksResources: (servicePairs: PrometheusApiSingleResult[], isMetricEnabled = false) => {
    const separator = '@_@';
    const sourceNodes =
      servicePairs?.map(({ metric }) => ({
        id: `${metric.sourceProcess || metric.sourceSite?.split(separator)[0]} (client)`,
        nodeColor: metric.sourceProcess ? VarColors.Blue400 : undefined
      })) || [];
    const destNodes =
      servicePairs?.map(({ metric }) => ({
        id: metric.destProcess || metric.destSite?.split(separator)[0],
        nodeColor: metric.destProcess ? VarColors.Blue400 : undefined
      })) || [];

    const nodes = [...sourceNodes, ...destNodes].filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);

    const links =
      servicePairs?.map(({ metric, value }) => ({
        source: `${metric.sourceProcess || metric.sourceSite?.split(separator)[0]} (client)`,
        target: metric.destProcess || metric.destSite?.split(separator)[0],
        value: isMetricEnabled ? Number(value[1]) : 0.01
      })) || [];

    return { nodes, links };
  }
};
