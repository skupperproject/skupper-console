import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import SkChartArea from '@core/components/SkChartArea';
import SkCounterCard from '@core/components/SkCounterCard';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';

import { MetricsLabels } from './Metrics.enum';
import { RequestMetrics } from './services/services.interfaces';

const RequestCharts: FC<{
  requestRateData: RequestMetrics[];
  totalRequestsInterval: number;
  avgRequestRateInterval: number;
}> = memo(({ requestRateData, totalRequestsInterval, avgRequestRateInterval }) => (
  <Grid hasGutter>
    {/* Chart requests time series card*/}
    <GridItem span={8} rowSpan={2}>
      <Card isFullHeight>
        <CardTitle>{MetricsLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
        <CardBody>
          <SkChartArea
            formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
            themeColor={ChartThemeColor.purple}
            legendLabels={requestRateData.map(({ label }) => label)}
            data={requestRateData.map(({ data }) => data)}
          />
        </CardBody>
      </Card>
    </GridItem>

    {/*  Partial total request card*/}
    <GridItem span={4}>
      <SkCounterCard
        title={MetricsLabels.RequestTotalTitle}
        value={totalRequestsInterval}
        bgColor={'--pf-global--palette--purple-400'}
        colorChart={ChartThemeColor.purple}
        showChart={false}
      />
    </GridItem>

    {/*  avg request per second card*/}
    <GridItem span={4}>
      <SkCounterCard
        title={MetricsLabels.RequestRateAvgTitle}
        value={avgRequestRateInterval}
        bgColor={'--pf-global--palette--purple-200'}
        showChart={false}
      />
    </GridItem>
  </Grid>
));

export default RequestCharts;
