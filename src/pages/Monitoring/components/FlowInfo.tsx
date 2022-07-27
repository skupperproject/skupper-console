import React, { FC } from 'react';

import { Card, CardBody, CardTitle, Page } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import DescriptionItem from '@pages/Sites/components/DescriptionItem';

import { FlowInfoColumns, FlowInfoLables } from './FlowInfo.enum';
import { FlowsInfoProps } from './FlowInfo.interfaces';

const FlowInfo: FC<FlowsInfoProps> = function ({ connection }) {
    const { startFlow, endFlow } = connection;

    return (
        <Page>
            <DescriptionItem
                title={FlowInfoColumns.Address}
                value={startFlow?.device.address || ''}
            />
            <DescriptionItem
                title={FlowInfoColumns.Protocol}
                value={startFlow?.device.protocol || ''}
            />

            <Card className="pf-u-mb-md">
                <CardBody>
                    <CardTitle>{FlowInfoLables.TrafficChartTitle}</CardTitle>
                    <RealTimeLineChart
                        options={{
                            chartColor: ChartThemeColors.Multi,
                            padding: {
                                bottom: 70,
                                left: 0,
                                right: 0,
                                top: 0,
                            },
                            height: 300,
                            dataLegend: [
                                { name: `${startFlow.sourceHost}: ${startFlow.sourcePort}` },
                                { name: `${endFlow?.sourceHost}: ${endFlow?.sourcePort}` },
                            ],
                            formatter: formatBytes,
                        }}
                        data={[
                            { name: `flow`, value: startFlow.octets },
                            { name: `couterflow`, value: endFlow?.octets || 0 },
                        ]}
                    />
                </CardBody>
            </Card>
            <TableComposable borders={true} isStriped variant="compact">
                <Thead>
                    <Tr>
                        <Th>{FlowInfoColumns.Source}</Th>
                        <Th>{FlowInfoColumns.SiteName}</Th>
                        <Th>{FlowInfoColumns.ProcessName}</Th>
                        <Th>{FlowInfoColumns.ProcessHost}</Th>
                        <Th>{FlowInfoColumns.ProcessImg}</Th>
                        <Th>{FlowInfoColumns.RouterName}</Th>
                        <Th>{FlowInfoColumns.RouterHostName}</Th>
                        <Th>{FlowInfoColumns.Bytes}</Th>
                        <Th>{FlowInfoColumns.ByteRate}</Th>
                        <Th>{FlowInfoColumns.Latency}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td dataLabel={FlowInfoColumns.Source}>
                            {`${startFlow?.sourceHost}: ${startFlow?.sourcePort}`}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.SiteName}>{startFlow?.site.name}</Td>
                        <Td dataLabel={FlowInfoColumns.ProcessName}>
                            {startFlow?.processFlow.name}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.ProcessHost}>
                            {startFlow?.processFlow.sourceHost}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.ProcessImg}>
                            {startFlow?.processFlow.imageName}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.RouterName}>{startFlow?.router.name}</Td>
                        <Td dataLabel={FlowInfoColumns.RouterHostName}>
                            {startFlow?.router.hostame}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.Bytes}>
                            {formatBytes(startFlow?.octets || 0)}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.ByteRate}>
                            {`${formatBytes(startFlow?.octetRate || 0)}/sec`}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.Latency}>
                            {formatTime(startFlow?.latency || 0)}
                        </Td>
                    </Tr>
                    {endFlow && (
                        <Tr>
                            <Td dataLabel={FlowInfoColumns.Source}>
                                {`${endFlow?.sourceHost}: ${endFlow?.sourcePort}`}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.SiteName}>{endFlow?.site.name}</Td>
                            <Td dataLabel={FlowInfoColumns.ProcessName}>
                                {endFlow?.processFlow.name}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.ProcessHost}>
                                {endFlow?.processFlow.sourceHost}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.ProcessImg}>
                                {endFlow?.processFlow.imageName}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.RouterName}>{endFlow?.router.name}</Td>
                            <Td dataLabel={FlowInfoColumns.RouterHostName}>
                                {endFlow?.router.hostame}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.Bytes}>
                                {formatBytes(endFlow?.octets || 0)}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.ByteRate}>
                                {`${formatBytes(endFlow?.octetRate || 0)}/sec`}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.Latency}>
                                {formatTime(endFlow?.latency || 0)}
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </TableComposable>
        </Page>
    );
};

export default FlowInfo;
