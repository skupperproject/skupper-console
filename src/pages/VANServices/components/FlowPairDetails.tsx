import React, { FC } from 'react';

import { Card, CardBody, CardTitle, Page, Tooltip } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import DescriptionItem from '@pages/Sites/components/DescriptionItem';

import { FlowPairDetailsColumns, FlowPairDetailsLabels } from '../VANServices.enum';
import { FlowPairDetailsProps } from '../VANServices.interfaces';

const FlowPairDetails: FC<FlowPairDetailsProps> = function ({ connection }) {
    const { startFlow, endFlow } = connection;

    return (
        <Page>
            <DescriptionItem
                title={FlowPairDetailsColumns.VANService}
                value={startFlow?.device.address || ''}
            />
            <DescriptionItem
                title={FlowPairDetailsColumns.Protocol}
                value={startFlow?.device.protocol || ''}
            />

            <Card className="pf-u-mb-md">
                <CardBody>
                    <CardTitle>{FlowPairDetailsLabels.TrafficChartTitle}</CardTitle>
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
                                { name: `${startFlow.processFlow.name}` },
                                { name: `${endFlow?.processFlow.name || ''}` },
                            ],
                            formatter: formatBytes,
                        }}
                        data={[
                            { name: `${startFlow.processFlow.name}`, value: startFlow.octetRate },
                            {
                                name: `${endFlow?.processFlow.name || ''}`,
                                value: endFlow?.octetRate || 0,
                            },
                        ]}
                    />
                </CardBody>
            </Card>
            <TableComposable borders={true} isStriped variant="compact">
                <Thead>
                    <Tr>
                        <Th>{FlowPairDetailsColumns.SiteName}</Th>
                        <Th>{FlowPairDetailsColumns.ProcessName}</Th>
                        <Th>{FlowPairDetailsColumns.ProcessHost}</Th>
                        <Th>{FlowPairDetailsColumns.ProcessImg}</Th>
                        <Th>{FlowPairDetailsColumns.Bytes}</Th>
                        <Th>{FlowPairDetailsColumns.ByteRate}</Th>
                        <Th width={10}>
                            {FlowPairDetailsColumns.Latency}
                            <Tooltip content={FlowPairDetailsLabels.TTFBDesc}>
                                <InfoCircleIcon
                                    color="var(--pf-global--palette--blue-300)"
                                    className="pf-u-ml-xs"
                                />
                            </Tooltip>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td dataLabel={FlowPairDetailsColumns.SiteName}>{startFlow?.site.name}</Td>
                        <Td dataLabel={FlowPairDetailsColumns.ProcessName}>
                            {startFlow?.processFlow.name}
                        </Td>
                        <Td dataLabel={FlowPairDetailsColumns.ProcessHost}>
                            {startFlow?.processFlow.sourceHost}
                        </Td>
                        <Td dataLabel={FlowPairDetailsColumns.ProcessImg}>
                            {startFlow?.processFlow.imageName}
                        </Td>
                        <Td dataLabel={FlowPairDetailsColumns.Bytes}>
                            {formatBytes(startFlow?.octets || 0)}
                        </Td>
                        <Td dataLabel={FlowPairDetailsColumns.ByteRate}>
                            {`${formatBytes(startFlow?.octetRate || 0)}/sec`}
                        </Td>
                        <Td dataLabel={FlowPairDetailsColumns.Latency}>
                            {formatTime(startFlow?.latency || 0)}
                        </Td>
                    </Tr>
                    {endFlow && (
                        <Tr>
                            <Td dataLabel={FlowPairDetailsColumns.SiteName}>
                                {endFlow?.site.name}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.ProcessName}>
                                {endFlow?.processFlow.name}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.ProcessHost}>
                                {endFlow?.processFlow.sourceHost}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.ProcessImg}>
                                {endFlow?.processFlow.imageName}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.Bytes}>
                                {formatBytes(endFlow?.octets || 0)}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.ByteRate}>
                                {`${formatBytes(endFlow?.octetRate || 0)}/sec`}
                            </Td>
                            <Td dataLabel={FlowPairDetailsColumns.Latency}>
                                {formatTime(endFlow?.latency || 0)}
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </TableComposable>
        </Page>
    );
};

export default FlowPairDetails;
