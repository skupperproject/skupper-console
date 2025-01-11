import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Labels } from '../../../../config/labels';
import SkChartArea from '../../../../core/components/SkChartArea';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { RequestMetrics } from '../../../../types/Metrics.interfaces';

const RequestCharts: FC<{
  requestRateData: RequestMetrics[];
  requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
}> = memo(({ requestRateData, requestPerf }) => (
  <Flex direction={{ xl: 'row', default: 'column' }}>
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
      <Table borders={false}>
        <Thead noWrap>
          <Tr>
            <Th>{Labels.Method}</Th>
            <Th>{Labels.MaxRequestRate}</Th>
            <Th>{Labels.RequestRateAvgTitle}</Th>
            <Th>{Labels.RequestRateCurrentTitle}</Th>
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
