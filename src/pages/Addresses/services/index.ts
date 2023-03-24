import { PrometheusApiResultSingle } from 'API/Prometheus.interfaces';
import { AddressResponse } from 'API/REST.interfaces';

export const AddressesController = {
  extendAddressesWithActiveAndTotalFlowPairs: (
    addresses: AddressResponse[],
    {
      httpTotalFlows,
      tcpActiveFlows
    }: { httpTotalFlows: PrometheusApiResultSingle[]; tcpActiveFlows: PrometheusApiResultSingle[] }
  ) => {
    const tcpActiveFlowsMap = tcpActiveFlows.reduce((acc, flow) => {
      acc[flow.metric.address] = Number(flow.value[1]) / 2;

      return acc;
    }, {} as Record<string, number>);

    const httpTotalFlowsMap = httpTotalFlows?.reduce((acc, flow) => {
      acc[flow.metric.address] = Number(flow.value[1]) / 2;

      return acc;
    }, {} as Record<string, number>);

    return addresses.map((address) => ({
      ...address,
      totalFlows: Math.round(httpTotalFlowsMap[address.name]),
      currentFlows: Math.round(tcpActiveFlowsMap[address.name])
    }));
  }
};
