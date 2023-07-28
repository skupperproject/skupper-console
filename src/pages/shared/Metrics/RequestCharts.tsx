import { FC, memo } from 'react';

import { Bullseye, Divider, Flex, FlexItem, Title } from '@patternfly/react-core';

import SkChartArea from '@core/components/SkChartArea';
import { formatNumber } from '@core/utils/formatNumber';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';

import { MetricsLabels } from './Metrics.enum';
import { RequestMetrics } from './services/services.interfaces';

const RequestCharts: FC<{
  requestRateData: RequestMetrics[];
  totalRequestsInterval: number;
  avgRequestRateInterval: number;
}> = memo(({ requestRateData, totalRequestsInterval, avgRequestRateInterval }) => (
  <Flex direction={{ sm: 'column', md: 'row' }}>
    {/* Chart requests time series card*/}
    <FlexItem flex={{ default: 'flex_2' }}>
      <SkChartArea
        formatY={(y: number) => `${formatToDecimalPlacesIfCents(y, 3)} rps`}
        legendLabels={requestRateData.map(({ label }) => `${label}`)}
        data={requestRateData.map(({ data }) => data)}
      />
    </FlexItem>

    <Divider orientation={{ default: 'vertical' }} />
    {/*  Partial total request card*/}
    <Flex
      flex={{ default: 'flex_1' }}
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsCenter' }}
      alignSelf={{ default: 'alignSelfStretch' }}
    >
      <FlexItem flex={{ default: 'flex_1' }}>
        <Bullseye>
          <Title headingLevel="h1">{`${MetricsLabels.RequestTotalTitle}: ${formatNumber(
            totalRequestsInterval
          )}`}</Title>
        </Bullseye>
      </FlexItem>

      <Divider />

      {/*  avg request per second card*/}
      <FlexItem flex={{ default: 'flex_1' }}>
        <Bullseye>
          <Title headingLevel="h1">{`${MetricsLabels.RequestRateAvgTitle}: ${avgRequestRateInterval}`}</Title>
        </Bullseye>
      </FlexItem>
    </Flex>
  </Flex>
));

export default RequestCharts;
