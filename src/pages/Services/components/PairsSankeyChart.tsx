import { FC, useCallback, useState, startTransition } from 'react';

import { Card, CardBody, CardHeader, Content, ContentVariants } from '@patternfly/react-core';

import SkSankeyChart from '../../../core/components/SKSanckeyChart';
import {
  ServiceClientResourceOptions,
  ServiceServerResourceOptions
} from '../../../core/components/SKSanckeyChart/SkSankey.constants';
import { ServicesController } from '../services';
import { defaultMetricOption as defaultMetric } from '../Services.constants';
import { ServicesLabels } from '../Services.enum';

interface Pairs {
  sourceName: string;
  sourceSiteName?: string;
  destinationName: string;
  destinationSiteName?: string;
  byteRate?: number;
  color?: string;
}

interface PairsSankeyChartProps {
  pairs: Pairs[];
  showFilter?: boolean;
}

const PairsSankeyChart: FC<PairsSankeyChartProps> = function ({ pairs, showFilter = true }) {
  const [metricSelected, setMetricSelected] = useState(defaultMetric);
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
      visibleMetrics: string;
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
    normalizePairs(pairs, clientResourceSelected, serverResourceSelected),
    metricSelected !== defaultMetric
  );

  return (
    <Card>
      <CardHeader>
        <Content>
          <Content component={ContentVariants.h1}>{ServicesLabels.SankeyChartTitle}</Content>
          <Content component="p">{ServicesLabels.SankeyChartDescription}</Content>
        </Content>
      </CardHeader>
      <CardBody>
        <SkSankeyChart data={{ nodes, links }} onSearch={showFilter ? handleFindPairType : undefined} />
      </CardBody>
    </Card>
  );
};

export default PairsSankeyChart;

function normalizePairs(pairs: Pairs[], clientType: 'client' | 'clientSite', serverType: 'server' | 'serverSite') {
  return pairs.map((pair) => ({
    ...pair,
    sourceName: clientType === 'client' ? pair.sourceName : (pair.sourceSiteName as string),
    destinationName: serverType === 'server' ? pair.destinationName : (pair.destinationSiteName as string),
    sourceSiteName: clientType === 'clientSite' ? pair.sourceSiteName : '',
    destinationSiteName: serverType === 'serverSite' ? pair.destinationSiteName : ''
  }));
}
