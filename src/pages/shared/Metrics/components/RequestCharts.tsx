import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import SkChartArea from '../../../../core/components/SkChartArea';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { RequestMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsLabels } from '../Metrics.enum';

const RequestCharts: FC<{
  requestRateData: RequestMetrics[];
  requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
}> = memo(({ requestRateData, requestPerf }) => (
  <Flex direction={{ xl: 'row', md: 'column' }}>
    <FlexItem flex={{ default: 'flex_2' }}>
      <SkChartArea
        data={requestRateData.map(({ data }) => data)}
        formatY={(y: number) => `${formatToDecimalPlacesIfCents(y, 3)} rps`}
        legendLabels={requestRateData.map(({ label }) => `${label}`)}
        themeColor={ChartThemeColor.yellow}
      />
    </FlexItem>

    <Divider orientation={{ default: 'vertical' }} />
    <Flex flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
      <Table borders={false} variant="compact">
        <Thead noWrap>
          <Tr>
            <Th>{MetricsLabels.Method}</Th>
            <Th>{MetricsLabels.MaxRequestRate}</Th>
            <Th>{MetricsLabels.RequestRateAvgTitle}</Th>
            <Th>{MetricsLabels.RequestRateCurrentTitle}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requestPerf?.map((request, index) => (
            <Tr key={`${request.label}-${index}`}>
              <Td>{request.label}</Td>
              <Th>{request.max}</Th>
              <Th>{request.avg}</Th>
              <Th>{request.current}</Th>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  </Flex>
));

export default RequestCharts;
