import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
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
import { FlowPairsLabels, QueriesServices } from '../Services.enum';

interface ResourceDistrubutionFlowChartProps {
  serviceId: string;
  serviceName: string;
}

const ResourceDistrubutionFlowChart: FC<ResourceDistrubutionFlowChartProps> = function ({ serviceId, serviceName }) {
  const [metricSelected, setMetricSelected] = useState(defaultMetric);
  const [clientResourceSelected, setClientResourceSelected] = useState<'client' | 'clientSite'>(
    ServiceClientResourceOptions[0].id
  );
  const [serverResourceSelected, setServerResourceSelected] = useState<'server' | 'serverSite'>(
    ServiceServerResourceOptions[0].id
  );

  const { data: processPairs } = useQuery(
    [QueriesServices.GetProcessPairsByService, serviceName, clientResourceSelected, serverResourceSelected],
    () => RESTApi.fetchProcessPairsByService(serviceId),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: servicePairs } = useQuery(
    [QueriesServices.GetResourcePairsByService, serviceName, clientResourceSelected, serverResourceSelected],
    () =>
      PrometheusApi.fethServicePairsByService({
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
    servicePairs || [],
    metricSelected === defaultMetric
  );

  if (!nodes.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <Title headingLevel="h1">{FlowPairsLabels.SankeyChartTitle}</Title>
        <Title headingLevel="h4">{FlowPairsLabels.SankeyChartDescription}</Title>
      </CardHeader>
      <CardBody>
        <SankeyFilter onSearch={handleGetPairType} />
        <SkSankeyChart data={{ nodes, links }} />
      </CardBody>
    </Card>
  );
};

export default ResourceDistrubutionFlowChart;
