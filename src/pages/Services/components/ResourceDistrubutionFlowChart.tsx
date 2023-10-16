import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardHeader, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import SkSankeyChart from '@core/components/SKSanckeyChart';
import SankeyFilter, {
  ServiceClientResourceOptions,
  ServiceServerResourceOptions
} from '@core/components/SKSanckeyChart/SankeyFilter';

import { ServicesController } from '../services';
import { defaultMetricOption as defaultMetric } from '../Services.constants';
import { ServicesLabels, QueriesServices } from '../Services.enum';

interface ResourceDistrubutionFlowChartProps {
  serviceId: string;
  serviceName: string;
}

const ResourceDistributionFlowChart: FC<ResourceDistrubutionFlowChartProps> = function ({ serviceId, serviceName }) {
  const [metricSelected, setMetricSelected] = useState(defaultMetric);
  const [clientResourceSelected, setClientResourceSelected] = useState<'client' | 'clientSite'>(
    ServiceClientResourceOptions[0].id
  );
  const [serverResourceSelected, setServerResourceSelected] = useState<'server' | 'serverSite'>(
    ServiceServerResourceOptions[0].id
  );

  const { data: processPairs } = useQuery(
    [QueriesServices.GetProcessPairsByService, serviceId],
    () => RESTApi.fetchProcessPairsByService(serviceId),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: resourcePairs } = useQuery(
    [
      QueriesServices.GetResourcePairsByService,
      serviceName,
      clientResourceSelected,
      serverResourceSelected,
      processPairs
    ],
    () =>
      PrometheusApi.fethResourcePairsByService({
        serviceName,
        clientType: clientResourceSelected,
        serverType: serverResourceSelected,
        sourceProcesses: processPairs?.results.map(({ sourceName }) => sourceName).join('|'),
        destProcesses: processPairs?.results.map(({ destinationName }) => destinationName).join('|')
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true,
      enabled: !!processPairs?.results.length
    }
  );

  const handleGetPairType = useCallback(
    ({
      clientType,
      serverType,
      visibleMetrics
    }: {
      clientType: 'client' | 'clientSite';
      serverType: 'server' | 'serverSite';
      visibleMetrics: string;
    }) => {
      setClientResourceSelected(clientType);
      setServerResourceSelected(serverType);
      setMetricSelected(visibleMetrics);
    },
    []
  );

  const { nodes, links } = ServicesController.convertToSankeyChartData(
    resourcePairs || [],
    metricSelected !== defaultMetric
  );

  return (
    <Card>
      <CardHeader>
        <TextContent>
          <Text component={TextVariants.h1}>{ServicesLabels.SankeyChartTitle}</Text>
          <Text>{ServicesLabels.SankeyChartDescription}</Text>
        </TextContent>
      </CardHeader>
      <CardBody>
        <SankeyFilter onSearch={handleGetPairType} />
        <SkSankeyChart data={{ nodes, links }} />
      </CardBody>
    </Card>
  );
};

export default ResourceDistributionFlowChart;
