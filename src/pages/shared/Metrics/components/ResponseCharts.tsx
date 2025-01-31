import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Divider, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';

import { Labels } from '../../../../config/labels';
import { hexColors } from '../../../../config/styles';
import SkBasicTile from '../../../../core/components/SkBasicTile';
import SkChartArea from '../../../../core/components/SkChartArea';
import SkChartPie from '../../../../core/components/SkChartPie';
import { convertToPercentage } from '../../../../core/utils/convertToPercentage';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { ResponseMetrics } from '../../../../types/Metrics.interfaces';

const errorRateChartPadding = { left: 40, bottom: 0, top: 0, right: 40 };

function createStatusLabel(label: string) {
  return `${label}xx`;
}

const ResponseCharts: FC<{ responseRateData: ResponseMetrics | null; responseData: ResponseMetrics }> = memo(
  ({ responseRateData, responseData }) => (
    <>
      <Grid hasGutter>
        {/* HTTP stats */}
        <GridItem md={3} sm={12}>
          <SkBasicTile
            title={createStatusLabel(responseData.statusCode2xx.label)}
            value={convertToPercentage(responseData.statusCode2xx.total, responseData.total) || ' - '}
            bgColor={hexColors.Green500}
          />
        </GridItem>
        <GridItem md={3} sm={12}>
          <SkBasicTile
            title={createStatusLabel(responseData.statusCode3xx.label)}
            value={convertToPercentage(responseData.statusCode3xx.total, responseData.total) || ' - '}
            bgColor={hexColors.Blue400}
          />
        </GridItem>
        <GridItem md={3} sm={12}>
          <SkBasicTile
            title={createStatusLabel(responseData.statusCode4xx.label)}
            value={convertToPercentage(responseData.statusCode4xx.total, responseData.total) || ' - '}
            bgColor={hexColors.Orange300}
          />
        </GridItem>
        <GridItem md={3} sm={12}>
          <SkBasicTile
            title={createStatusLabel(responseData.statusCode5xx.label)}
            value={convertToPercentage(responseData.statusCode5xx.total, responseData.total) || ' - '}
            bgColor={hexColors.Red500}
          />
        </GridItem>
      </Grid>
      <br /> <br />
      {/* Errors distribution */}
      <Flex style={{ alignItems: 'center' }} direction={{ xl: 'row', default: 'column' }}>
        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartArea
            formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
            legendLabels={[`${createStatusLabel(responseData.statusCode4xx.label)} ${Labels.ErrorRate}`]}
            data={[responseRateData?.statusCode4xx.data || [{ x: 0, y: 0 }]]}
            padding={errorRateChartPadding}
            themeColor={ChartThemeColor.orange}
          />
        </FlexItem>

        <Divider orientation={{ md: 'horizontal', xl: 'vertical' }} />

        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartArea
            formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
            legendLabels={[`${createStatusLabel(responseData.statusCode5xx.label)} ${Labels.ErrorRate}`]}
            data={[responseRateData?.statusCode5xx.data || [{ x: 0, y: 0 }]]}
            padding={errorRateChartPadding}
            themeColor={ChartThemeColor.yellow}
          />
        </FlexItem>

        <Divider orientation={{ md: 'horizontal', xl: 'vertical' }} />

        <FlexItem flex={{ default: 'flex_1' }}>
          <SkChartPie
            height={300}
            format={(y: number) => `${y} ${Labels.Errors}`}
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
            themeColor={ChartThemeColor.orange}
          />
        </FlexItem>
      </Flex>
    </>
  )
);

export default ResponseCharts;
