import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle, Grid, GridItem } from '@patternfly/react-core';

import SkChartArea from '@core/components/SkChartArea';
import SkChartPie from '@core/components/SkChartPie';
import SkCounterCard from '@core/components/SkCounterCard';
import { convertToPercentage } from '@core/utils/convertToPercentage';
import { formatBytes } from '@core/utils/formatBytes';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';

import { MetricsLabels } from './Metrics.enum';
import { ResponseMetrics } from './services/services.interfaces';

const ResponseCharts: FC<{ responseRateData: ResponseMetrics; responseData: ResponseMetrics }> = memo(
  ({ responseRateData, responseData }) => (
    <Grid hasGutter>
      {/* HTTP stats */}
      <GridItem span={3}>
        <SkCounterCard
          title={responseData.statusCode2xx.label}
          value={convertToPercentage(responseData.statusCode2xx.total, responseData.total) || ' - '}
          bgColor={'--pf-global--palette--green-400'}
          showChart={false}
        />
      </GridItem>
      <GridItem span={3}>
        <SkCounterCard
          title={responseData.statusCode3xx.label}
          value={convertToPercentage(responseData.statusCode3xx.total, responseData.total) || ' - '}
          bgColor={'--pf-global--palette--blue-400'}
          showChart={false}
        />
      </GridItem>
      <GridItem span={3}>
        <SkCounterCard
          title={responseData.statusCode4xx.label}
          value={convertToPercentage(responseData.statusCode4xx.total, responseData.total) || ' - '}
          bgColor={'--pf-global--palette--orange-100'}
          showChart={false}
        />
      </GridItem>
      <GridItem span={3}>
        <SkCounterCard
          title={responseData.statusCode5xx.label}
          value={convertToPercentage(responseData.statusCode5xx.total, responseData.total) || ' - '}
          bgColor={'--pf-global--palette--red-100'}
          showChart={false}
        />
      </GridItem>

      {/* Errors distribution */}
      {!!(responseData.statusCode4xx.total + responseData.statusCode5xx.total) && (
        <GridItem span={4}>
          <Card isFullHeight>
            <SkChartPie
              format={formatBytes}
              data={[
                {
                  x: responseData.statusCode4xx.label,
                  y: responseData.statusCode4xx.total
                },
                {
                  x: responseData.statusCode5xx.label,
                  y: responseData.statusCode5xx.total
                }
              ]}
            />
          </Card>
        </GridItem>
      )}
      {!!responseRateData.statusCode4xx.data && (
        <GridItem span={4}>
          <Card isFullHeight>
            <CardTitle>{MetricsLabels.ClientErrorRateSeriesAxisYLabel}</CardTitle>
            <CardBody>
              <SkChartArea
                formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                themeColor={ChartThemeColor.orange}
                legendLabels={[responseRateData.statusCode4xx.label]}
                data={[responseRateData.statusCode4xx.data]}
              />
            </CardBody>
          </Card>
        </GridItem>
      )}

      {!!responseRateData.statusCode5xx?.data && (
        <GridItem span={4}>
          <Card isFullHeight>
            <CardTitle>{MetricsLabels.ServerErrorRateSeriesAxisYLabel}</CardTitle>
            <CardBody>
              <SkChartArea
                formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                themeColor={ChartThemeColor.orange}
                legendLabels={[responseRateData.statusCode5xx.label]}
                data={[responseRateData.statusCode5xx.data]}
              />
            </CardBody>
          </Card>
        </GridItem>
      )}
    </Grid>
  )
);

export default ResponseCharts;
