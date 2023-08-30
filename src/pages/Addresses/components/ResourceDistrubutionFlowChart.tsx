import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { UPDATE_INTERVAL } from '@config/config';
import SkSankeyChart from '@core/components/SKSanckeyChart';
import SankeyFilter, {
  ServiceClientResourceOptions,
  ServiceServerResourceOptions
} from '@core/components/SKSanckeyChart/SankeyFilter';

import { AddressesController } from '../services';
import { QueriesServices } from '../services/services.enum';
import { defaultMetricOption as defaultMetric } from '../Services.constants';
import { FlowPairsLabels } from '../Services.enum';

interface ResourceDistrubutionFlowChartProps {
  addressId: string;
  addressName: string;
}

const ResourceDistrubutionFlowChart: FC<ResourceDistrubutionFlowChartProps> = function ({ addressId, addressName }) {
  const [metricSelected, setMetricSelected] = useState(defaultMetric);
  const [clientResourceSelected, setClientResourceSelected] = useState<'client' | 'clientSite'>(
    ServiceClientResourceOptions[0].id
  );
  const [serverResourceSelected, setServerResourceSelected] = useState<'server' | 'serverSite'>(
    ServiceServerResourceOptions[0].id
  );

  const { data: servicePairs } = useQuery(
    [QueriesServices.GetResourcePairsByAddress, addressName, clientResourceSelected, serverResourceSelected],
    () =>
      addressId
        ? PrometheusApi.fethServicePairsByAddress({
            addressName,
            clientType: clientResourceSelected,
            serverType: serverResourceSelected
          })
        : null,
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
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

  const { nodes, links } = AddressesController.convertToSankeyChartData(
    servicePairs || [],
    metricSelected !== defaultMetric
  );

  if (!nodes.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <Title headingLevel="h1">{FlowPairsLabels.SankeyChartTitle}</Title>
      </CardHeader>
      <CardBody>
        <SankeyFilter onSearch={handleGetPairType} />
        <SkSankeyChart data={{ nodes, links }} />
      </CardBody>
    </Card>
  );
};

export default ResourceDistrubutionFlowChart;
