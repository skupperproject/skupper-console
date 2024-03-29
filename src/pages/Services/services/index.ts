import { VarColors } from '@config/colors';
import { prometheusSiteNameAndIdSeparator } from '@config/prometheus';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '@core/components/SKSanckeyChart/SkSankey.constants';
import { PrometheusApiSingleResult } from 'API/Prometheus.interfaces';
import { ServiceResponse } from 'API/REST.interfaces';

export const ServicesController = {
  extendServicesWithActiveAndTotalFlowPairs: (
    services: ServiceResponse[],
    {
      tcpActiveFlows
    }: {
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

    return services.map((service) => ({
      ...service,
      currentFlows:
        tcpActiveFlowsMap && tcpActiveFlowsMap[service.name] ? Math.round(tcpActiveFlowsMap[service.name]) : '-'
    }));
  },

  convertToSankeyChartData: (servicePairs: PrometheusApiSingleResult[], withMetric = false) => {
    const sourceProcessSuffix = 'client'; // The Sankey chart crashes when the same site is present in both the client and server positions. No circular dependency are allowed for this kind of chart

    const clients =
      servicePairs?.map(({ metric }) => ({
        id: `${
          metric.sourceProcess || metric.sourceSite?.split(prometheusSiteNameAndIdSeparator)[0]
        } ${sourceProcessSuffix}`,
        nodeColor: metric.sourceProcess ? VarColors.Blue400 : undefined
      })) || [];

    const servers =
      servicePairs?.map(({ metric }) => ({
        id: metric.destProcess || metric.destSite?.split(prometheusSiteNameAndIdSeparator)[0],
        nodeColor: metric.destProcess ? VarColors.Blue400 : undefined
      })) || [];

    const nodes = [...clients, ...servers].filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);

    const links =
      servicePairs.map(({ metric, value }) => ({
        source: `${
          metric.sourceProcess || metric.sourceSite?.split(prometheusSiteNameAndIdSeparator)[0]
        } ${sourceProcessSuffix}`,
        target: metric.destProcess || metric.destSite?.split(prometheusSiteNameAndIdSeparator)[0],
        value: withMetric ? Number(value[1]) : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
      })) || [];

    return { nodes, links };
  }
};
