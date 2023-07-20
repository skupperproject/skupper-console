import { PrometheusApiSingleResult } from 'API/Prometheus.interfaces';
import { AddressResponse } from 'API/REST.interfaces';

export const AddressesController = {
  extendAddressesWithActiveAndTotalFlowPairs: (
    services: AddressResponse[],
    {
      httpTotalFlows,
      tcpActiveFlows
    }: { httpTotalFlows: PrometheusApiSingleResult[]; tcpActiveFlows: PrometheusApiSingleResult[] }
  ) => {
    const tcpActiveFlowsMap =
      tcpActiveFlows.length &&
      tcpActiveFlows.reduce(
        (acc, flow) => {
          acc[flow.metric.address] = Number(flow.value[1]) / 2;

          return acc;
        },
        {} as Record<string, number>
      );

    const httpTotalFlowsMap =
      httpTotalFlows.length &&
      httpTotalFlows?.reduce(
        (acc, flow) => {
          acc[flow.metric.address] = Number(flow.value[1]) / 2;

          return acc;
        },
        {} as Record<string, number>
      );

    return services.map((service) => ({
      ...service,
      totalFlows:
        httpTotalFlowsMap && httpTotalFlowsMap[service.name] ? Math.round(httpTotalFlowsMap[service.name]) : 0,
      currentFlows:
        tcpActiveFlowsMap && tcpActiveFlowsMap[service.name] ? Math.round(tcpActiveFlowsMap[service.name]) : 0
    }));
  }
};
