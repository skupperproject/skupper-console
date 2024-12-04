import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Divider, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';

import { Colors } from '../../../../config/colors';
import { PATTERNFLY_VERSION } from '../../../../config/config';
import SkChartArea from '../../../../core/components/SkChartArea';
import SkChartPie from '../../../../core/components/SkChartPie';
import SkCounterCard from '../../../../core/components/SkCounterCard';
import { convertToPercentage } from '../../../../core/utils/convertToPercentage';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { ResponseMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsLabels } from '../Metrics.enum';

const errorDistributionPadding = { left: 0, bottom: 65, top: 50, right: 0 };
const errorRateChartPadding = { left: 40, bottom: 80, top: 50, right: 40 };

function createStatusLabel(label: string) {
  return `${label}xx`;
}

const ResponseCharts: FC<{ responseRateData: ResponseMetrics | null; responseData: ResponseMetrics }> = memo(
  ({ responseRateData, responseData }) => (
    <>
      <Grid hasGutter>
        {/* HTTP stats */}
        <GridItem span={3}>
          <SkCounterCard
            title={createStatusLabel(responseData.statusCode2xx.label)}
            value={convertToPercentage(responseData.statusCode2xx.total, responseData.total) || ' - '}
            bgColor={Colors.Green500}
          />
        </GridItem>
        <GridItem span={3}>
          <SkCounterCard
            title={createStatusLabel(responseData.statusCode3xx.label)}
            value={convertToPercentage(responseData.statusCode3xx.total, responseData.total) || ' - '}
            bgColor={Colors.Blue400}
          />
        </GridItem>
        <GridItem span={3}>
          <SkCounterCard
            title={createStatusLabel(responseData.statusCode4xx.label)}
            value={convertToPercentage(responseData.statusCode4xx.total, responseData.total) || ' - '}
            bgColor={Colors.Orange200}
          />
        </GridItem>
        <GridItem span={3}>
          <SkCounterCard
            title={createStatusLabel(responseData.statusCode5xx.label)}
            value={convertToPercentage(responseData.statusCode5xx.total, responseData.total) || ' - '}
            bgColor={Colors.Red200}
          />
        </GridItem>
      </Grid>
      {/* Errors distribution */}
      <Flex
        alignItems={{ default: 'alignItemsStretch', md: 'alignItemsStretch' }}
        direction={{ md: 'column', xl: 'row' }}
        className={`pf-${PATTERNFLY_VERSION}-u-mt-2xl`}
      >
        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartArea
            formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
            legendLabels={[
              `${createStatusLabel(responseData.statusCode4xx.label)} ${MetricsLabels.ErrorRateSeriesAxisYLabel}`
            ]}
            data={[responseRateData?.statusCode4xx.data || [{ x: 0, y: 0 }]]}
            padding={errorRateChartPadding}
            themeColor={ChartThemeColor.orange}
          />
        </FlexItem>

        <Divider orientation={{ md: 'horizontal', xl: 'vertical' }} />

        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartArea
            formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
            legendLabels={[
              `${createStatusLabel(responseData.statusCode5xx.label)} ${MetricsLabels.ErrorRateSeriesAxisYLabel}`
            ]}
            data={[responseRateData?.statusCode5xx.data || [{ x: 0, y: 0 }]]}
            padding={errorRateChartPadding}
            themeColor={ChartThemeColor.gold}
          />
        </FlexItem>

        <Divider orientation={{ md: 'horizontal', xl: 'vertical' }} />

        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartPie
            format={(y: number) => `${y} ${MetricsLabels.ErrorLabel}`}
            data={[
              {
                x: createStatusLabel(responseData.statusCode4xx.label),
                y: responseData.statusCode4xx.total
              },
              {
                x: createStatusLabel(responseData.statusCode5xx.label),
                y: responseData.statusCode5xx.total
              }
            ]}
            padding={errorDistributionPadding}
            themeColor={ChartThemeColor.orange}
          />
        </FlexItem>
      </Flex>
    </>
  )
);

export default ResponseCharts;
