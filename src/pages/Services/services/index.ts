import { VarColors } from '@config/colors';
import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { DEFAULT_SANKEY_CHART_FLOW_VALUE } from '@core/components/SKSanckeyChart/SkSankey.constants';
import { PrometheusMetric } from '@sk-types/Prometheus.interfaces';
import { ServiceResponse } from '@sk-types/REST.interfaces';
import { SkSankeyChartLink, SkSankeyChartNode } from '@sk-types/SkSankeyChart.interfaces';

export const ServicesController = {
  extendServicesWithActiveAndTotalBiFlows: (
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
          acc[flow.metric[PrometheusLabelsV2.RoutingKey]] = Number(flow.value[1]);

          return acc;
        },
        {} as Record<string, number>
      );

    return services.map((service) => ({
      ...service,
      currentFlows:
        tcpActiveFlowsMap && tcpActiveFlowsMap[service.name]
          ? Math.round(tcpActiveFlowsMap[service.name])
          : EMPTY_VALUE_PLACEHOLDER
    }));
  },

  convertToSankeyChartData: (servicePairs: PrometheusMetric<'vector'>[], withMetric = false) => {
    const sourceProcessSuffix = 'client'; // The Sankey chart crashes when the same site is present in both the client and server positions. No circular dependency are allowed for this kind of chart

    const clients: SkSankeyChartNode[] =
      servicePairs?.map(({ metric }) => ({
        id: `${metric[PrometheusLabelsV2.SourceProcess] || metric[PrometheusLabelsV2.SourceSiteName]} ${sourceProcessSuffix}`,
        nodeColor: metric[PrometheusLabelsV2.SourceProcess] ? VarColors.Blue400 : undefined
      })) || [];

    const servers =
      servicePairs?.map(({ metric }) => ({
        id: metric[PrometheusLabelsV2.DestProcess] || metric[PrometheusLabelsV2.DestSiteName],
        nodeColor: metric.destProcess ? VarColors.Blue400 : undefined
      })) || [];

    const nodes = [...clients, ...servers]
      .filter(({ id }) => id)
      .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i) as SkSankeyChartNode[];

    const links =
      (servicePairs
        .map(({ metric, value }) => ({
          source: `${metric[PrometheusLabelsV2.SourceProcess] || metric[PrometheusLabelsV2.SourceSiteName]} ${sourceProcessSuffix}`,
          target: metric[PrometheusLabelsV2.DestProcess] || metric[PrometheusLabelsV2.DestSiteName],
          value: withMetric ? Number(value[1]) : DEFAULT_SANKEY_CHART_FLOW_VALUE // The Nivo sankey chart restricts the usage of the value 0 for maintaining the height of each flow. We use a value near 0
        }))
        .filter(({ source, target }) => source && target) as SkSankeyChartLink[]) || [];

    return { nodes, links };
  }
};
