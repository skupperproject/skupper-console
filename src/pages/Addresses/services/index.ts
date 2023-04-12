import { PrometheusApiSingleResult } from 'API/Prometheus.interfaces';
import { AddressResponse } from 'API/REST.interfaces';

export const AddressesController = {
  extendAddressesWithActiveAndTotalFlowPairs: (
    addresses: AddressResponse[],
    {
      httpTotalFlows,
      tcpActiveFlows
    }: { httpTotalFlows: PrometheusApiSingleResult[]; tcpActiveFlows: PrometheusApiSingleResult[] }
  ) => {
    const tcpActiveFlowsMap =
      tcpActiveFlows.length &&
      tcpActiveFlows.reduce((acc, flow) => {
        acc[flow.metric.address] = Number(flow.value[1]) / 2;

        return acc;
      }, {} as Record<string, number>);

    const httpTotalFlowsMap =
      httpTotalFlows.length &&
      httpTotalFlows?.reduce((acc, flow) => {
        acc[flow.metric.address] = Number(flow.value[1]) / 2;

        return acc;
      }, {} as Record<string, number>);

    return addresses.map((address) => ({
      ...address,
      totalFlows: httpTotalFlowsMap ? Math.round(httpTotalFlowsMap[address.name]) : 0,
      currentFlows: tcpActiveFlowsMap ? Math.round(tcpActiveFlowsMap[address.name]) : 0
    }));
  }
};
