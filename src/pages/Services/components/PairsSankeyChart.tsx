import { FC, useCallback, useState, startTransition } from 'react';

import { Card, CardBody, CardHeader, Content, ContentVariants } from '@patternfly/react-core';

import { Labels } from '../../../config/labels';
import SkSankeyChart from '../../../core/components/SKSanckeyChart';
import {
  ServiceClientResourceOptions,
  ServiceServerResourceOptions
} from '../../../core/components/SKSanckeyChart/SkSankey.constants';
import { formatByteRate, formatBytes } from '../../../core/utils/formatBytes';
import { MetricKeys } from '../../../types/SkSankeyChart.interfaces';
import { ServicesController } from '../services';

interface PairsSankeyChartProps {
  pairs: {
    sourceName: string;
    destinationName: string;
    sourceSiteName: string;
    destinationSiteName: string;
    bytes: number;
    byteRate: number;
  }[];
  showFilter?: boolean;
}

const mapFormatter: Record<MetricKeys, Function> = {
  bytes: formatBytes,
  byteRate: formatByteRate
};

const PairsSankeyChart: FC<PairsSankeyChartProps> = function ({ pairs, showFilter = true }) {
  const [metricSelected, setMetricSelected] = useState<MetricKeys | undefined>();
  const [clientResourceSelected, setClientResourceSelected] = useState<'client' | 'clientSite'>(
    ServiceClientResourceOptions[0].id
  );
  const [serverResourceSelected, setServerResourceSelected] = useState<'server' | 'serverSite'>(
    ServiceServerResourceOptions[0].id
  );

  const handleFindPairType = useCallback(
    ({
      clientType,
      serverType,
      visibleMetrics
    }: {
      clientType: 'client' | 'clientSite';
      serverType: 'server' | 'serverSite';
      visibleMetrics: MetricKeys;
    }) => {
      startTransition(() => {
        setClientResourceSelected(clientType);
        setServerResourceSelected(serverType);
        setMetricSelected(visibleMetrics);
      });
    },
    []
  );

  const { nodes, links } = ServicesController.convertPairsToSankeyChartData(
    mapPairsWithSiteAndClientNames(pairs, clientResourceSelected, serverResourceSelected),
    metricSelected
  );

  return (
    <Card>
      <CardHeader>
        <Content>
          <Content component={ContentVariants.h1}>{Labels.SankeyChartTitle}</Content>
          <Content component="p">{Labels.SankeyChartDescription}</Content>
        </Content>
      </CardHeader>
      <CardBody>
        <SkSankeyChart
          data={{ nodes, links }}
          onSearch={showFilter ? handleFindPairType : undefined}
          formatter={metricSelected && mapFormatter[metricSelected]}
        />
      </CardBody>
    </Card>
  );
};

export default PairsSankeyChart;

function mapPairsWithSiteAndClientNames(
  pairs: {
    sourceName: string;
    destinationName: string;
    sourceSiteName: string;
    destinationSiteName: string;
    bytes: number;
    byteRate: number;
  }[],
  clientType: 'client' | 'clientSite',
  serverType: 'server' | 'serverSite'
) {
  return pairs.map((pair) => ({
    ...pair,
    sourceName: clientType === 'client' ? pair.sourceName : (pair.sourceSiteName as string),
    destinationName: serverType === 'server' ? pair.destinationName : (pair.destinationSiteName as string),
    sourceSiteName: clientType === 'clientSite' ? pair.sourceSiteName : '',
    destinationSiteName: serverType === 'serverSite' ? pair.destinationSiteName : ''
  }));
}
