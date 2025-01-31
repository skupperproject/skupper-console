import { FC, memo } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';

import { Labels } from '../../../../config/labels';
import SkChartArea from '../../../../core/components/SkChartArea';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { formatLatency } from '../../../../core/utils/formatLatency';
import { LatencyMetrics } from '../../../../types/Metrics.interfaces';

interface LatencyChartsProps {
  inboundData?: LatencyMetrics[] | null;
  outboundData?: LatencyMetrics[] | null;
  isInboundLoading: boolean;
  isOutboundLoading: boolean;
  isInboundRefetching: boolean;
  isOutboundRefetching: boolean;
}

const LatencyCharts: FC<LatencyChartsProps> = memo(
  ({ inboundData, outboundData, isInboundLoading, isOutboundLoading, isInboundRefetching, isOutboundRefetching }) => (
    <Flex direction={{ xl: 'row', default: 'column' }} gap={{ default: 'gap4xl' }}>
      {!isOutboundLoading && outboundData?.length && (
        <FlexItem flex={{ default: 'flex_1' }}>
          {!isOutboundLoading && isOutboundRefetching && <SkIsLoading />}
          <SkChartArea
            title={`${Labels.LatencyInDescription} (${Labels.Inbound})`}
            formatY={formatLatency}
            legendLabels={outboundData.map(({ label }) => label)}
            data={outboundData.map(({ data }) => data)}
            isChartLine={true}
          />
        </FlexItem>
      )}
      {!isInboundLoading && inboundData?.length && (
        <FlexItem flex={{ default: 'flex_1' }}>
          {!isInboundLoading && isInboundRefetching && <SkIsLoading />}
          <SkChartArea
            title={`${Labels.LatencyOutDescription} (${Labels.Outbound})`}
            formatY={formatLatency}
            legendLabels={inboundData.map(({ label }) => label)}
            data={inboundData.map(({ data }) => data)}
            isChartLine={true}
          />
        </FlexItem>
      )}
    </Flex>
  )
);

export default LatencyCharts;
