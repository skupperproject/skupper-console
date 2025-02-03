import { FC, memo } from 'react';

import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Labels } from '../../../../config/labels';
import SkChartArea from '../../../../core/components/SkCharts/SkChartArea';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { RequestMetrics } from '../../../../types/Metrics.interfaces';

const RequestCharts: FC<{
  title?: string;
  requestRateData: RequestMetrics[];
  requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
}> = memo(({ requestRateData, requestPerf, title }) => (
  <Flex direction={{ xl: 'row', default: 'column' }}>
    <FlexItem flex={{ default: 'flex_2' }}>
      <SkChartArea
        title={title}
        data={requestRateData.map(({ data }) => data)}
        formatY={(y: number) => `${formatToDecimalPlacesIfCents(y, 3)} rps`}
        legendLabels={requestRateData.map(({ label }) => `${label}`)}
      />
    </FlexItem>

    <Divider orientation={{ default: 'vertical' }} />

    <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
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
              <Td>{request.max}</Td>
              <Td>{request.avg}</Td>
              <Td>{request.current}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </FlexItem>
  </Flex>
));

export default RequestCharts;
