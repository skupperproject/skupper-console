import { PrometheusMetric } from '@API/Prometheus.interfaces';
import { decomposePrometheusSiteLabel } from '@API/Prometheus.utils';
import { ServiceResponse } from '@API/REST.interfaces';
import { VarColors } from '@config/colors';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '@core/components/SKSanckeyChart/SkSankey.constants';

interface SKSankeyNodeProps {
  id: string;
  nodeColor?: string;
}

interface SKSankeyLinkProps {
  source: string;
  target: string;
  value: number;
}

export const ServicesController = {
  extendServicesWithActiveAndTotalFlowPairs: (
    services: ServiceResponse[],
    {
      tcpActiveFlows
    }: {
      tcpActiveFlows?: PrometheusMetric<'vector'>[];
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

    return services.map((service) => ({
      ...service,
      currentFlows:
        tcpActiveFlowsMap && tcpActiveFlowsMap[service.name] ? Math.round(tcpActiveFlowsMap[service.name]) : '-'
    }));
  },

  convertToSankeyChartData: (servicePairs: PrometheusMetric<'vector'>[], withMetric = false) => {
    const sourceProcessSuffix = 'client'; // The Sankey chart crashes when the same site is present in both the client and server positions. No circular dependency are allowed for this kind of chart

    const clients: SKSankeyNodeProps[] =
      servicePairs?.map(({ metric }) => ({
        id: `${metric.sourceProcess || decomposePrometheusSiteLabel(metric.sourceSite)} ${sourceProcessSuffix}`,
        nodeColor: metric.sourceProcess ? VarColors.Blue400 : undefined
      })) || [];

    const servers =
      servicePairs?.map(({ metric }) => ({
        id: metric.destProcess || decomposePrometheusSiteLabel(metric.destSite),
        nodeColor: metric.destProcess ? VarColors.Blue400 : undefined
      })) || [];

    const nodes = [...clients, ...servers]
      .filter(({ id }) => id)
      .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i) as SKSankeyNodeProps[];

    const links =
      (servicePairs
        .map(({ metric, value }) => ({
          source: `${metric.sourceProcess || decomposePrometheusSiteLabel(metric.sourceSite)} ${sourceProcessSuffix}`,
          target: metric.destProcess || decomposePrometheusSiteLabel(metric.destSite),
          value: withMetric ? Number(value[1]) : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
        }))
        .filter(({ source, target }) => source && target) as SKSankeyLinkProps[]) || [];

    return { nodes, links };
  }
};
