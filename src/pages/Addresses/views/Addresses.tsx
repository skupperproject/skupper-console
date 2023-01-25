import React, { useCallback } from 'react';

import { ChartPie } from '@patternfly/react-charts';
import {
    Card,
    CardTitle,
    Flex,
    Grid,
    GridItem,
    Text,
    TextContent,
    TextVariants,
    Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import SkTable from '@core/components/SkTable';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { AddressResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { AddressesColumnsNames, AddressesLabels, AddressesRoutesPaths } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 360;
const ITEM_DISPLAY_COUNT = 5;

const Addresses = function () {
    const navigate = useNavigate();

    const { data: addresses, isLoading } = useQuery(
        [QueriesAddresses.GetAddresses],
        () => RESTApi.fetchAddresses(),
        {
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        navigate(route);
    }

    const AddressNameLinkCell = useCallback(
        (props: LinkCellProps<AddressResponse>) =>
            LinkCell({
                ...props,
                type: 'address',
                link: `${AddressesRoutesPaths.Addresses}/${props.data.name}@${props.data.identity}@${props.data.protocol}`,
            }),
        [],
    );

    const addressesWithFlowPairsCounts = AddressesController.getAddressesWithFlowPairsCounts(
        addresses || [],
    );

    const sortedAddresses = addressesWithFlowPairsCounts.sort(
        (a, b) => b.currentFlows - a.currentFlows,
    );

    const sortedAddressesTCP = sortedAddresses.filter(
        ({ protocol }) => protocol === AvailableProtocols.Tcp,
    );

    const sortedAddressesHTTP = sortedAddresses.filter(
        ({ protocol }) => protocol !== AvailableProtocols.Tcp,
    );

    const topTrafficUploadByClient = sortedAddresses.reduce((acc, { protocol }) => {
        acc[protocol] = { name: protocol, x: protocol, y: (acc[protocol]?.y || 0) + 1 };

        return acc;
    }, {} as Record<string, any>);

    const topTrafficUpload = Object.values(topTrafficUploadByClient);

    const topCurrentConnectionsChartDataTCP = sortedAddressesTCP
        .map(({ name, currentFlows }) => ({
            x: name,
            name,
            y: currentFlows,
        }))
        .reduce((acc, item, index) => {
            if (index < ITEM_DISPLAY_COUNT && item.y) {
                acc.push(item);
            }

            return acc;
        }, [] as { x: string; name: string; y: number }[]);

    const topCurrentConnectionsChartDataHTTP = sortedAddressesHTTP
        .map(({ name, currentFlows }) => ({
            name,
            value: currentFlows,
        }))
        .reduce((acc, item, index) => {
            if (index < ITEM_DISPLAY_COUNT && item.value) {
                acc.push(item);
            }

            return acc;
        }, [] as { name: string; value: number }[]);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <Grid hasGutter data-cy="sk-addresses">
            <GridItem>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{AddressesLabels.Section}</Text>
                    </TextContent>
                    <Tooltip position="right" content={AddressesLabels.Description}>
                        <OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Flex>
            </GridItem>

            <GridItem span={4}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.ProtocolDistribution}</CardTitle>
                    <ChartPie
                        constrainToVisibleArea
                        data={topTrafficUpload?.map(({ x, y }) => ({
                            x,
                            y,
                        }))}
                        labels={topTrafficUpload?.map(({ name, y }) => `${name}: ${y}`)}
                        padding={{
                            bottom: 100,
                            left: 0,
                            right: 0,
                            top: 0,
                        }}
                        legendData={topTrafficUpload?.map(({ name, y }) => ({
                            name: `${name}: ${y}`,
                        }))}
                        legendOrientation="horizontal"
                        legendPosition="bottom"
                        height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                        themeColor={ChartThemeColors.Orange}
                    />
                </Card>
            </GridItem>
            <GridItem span={4}>
                <Card isFullHeight>
                    <SkTable
                        title={AddressesLabels.TCP}
                        columns={generateColumns(AvailableProtocols.Tcp)}
                        rows={sortedAddressesTCP}
                        pageSizeStart={DEFAULT_TABLE_PAGE_SIZE / 2}
                        components={{ AddressNameLinkCell }}
                    />
                </Card>
            </GridItem>

            <GridItem span={4}>
                <Card isFullHeight>
                    <SkTable
                        title={AddressesLabels.HTTP}
                        columns={generateColumns(AvailableProtocols.Http)}
                        pageSizeStart={DEFAULT_TABLE_PAGE_SIZE / 2}
                        rows={sortedAddressesHTTP}
                        components={{ AddressNameLinkCell }}
                    />
                </Card>
            </GridItem>

            <GridItem span={6}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.ConnectionsByAddress}</CardTitle>
                    <ChartPie
                        constrainToVisibleArea
                        data={topCurrentConnectionsChartDataTCP?.map(({ x, y }) => ({
                            x,
                            y,
                        }))}
                        labels={topCurrentConnectionsChartDataTCP?.map(
                            ({ name, y }) => `${name}: ${y}`,
                        )}
                        padding={{
                            bottom: 100,
                            left: -100,
                            right: 100,
                            top: 0,
                        }}
                        legendData={topCurrentConnectionsChartDataTCP?.map(({ name, y }) => ({
                            name: `${name}: ${y}`,
                        }))}
                        legendOrientation="vertical"
                        legendPosition="right"
                        height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                    />
                </Card>
            </GridItem>

            <GridItem span={6}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.RequestsByAddress}</CardTitle>
                    <ChartPie
                        constrainToVisibleArea
                        data={topCurrentConnectionsChartDataHTTP?.map(({ name, value }) => ({
                            x: name,
                            y: value,
                        }))}
                        labels={topCurrentConnectionsChartDataHTTP?.map(
                            ({ name, value }) => `${name}: ${value}`,
                        )}
                        padding={{
                            bottom: 100,
                            left: -100,
                            right: 100,
                            top: 0,
                        }}
                        legendData={topCurrentConnectionsChartDataHTTP?.map(({ name, value }) => ({
                            name: `${name}: ${value}`,
                        }))}
                        legendOrientation="vertical"
                        legendPosition="right"
                        themeColor={ChartThemeColors.Green}
                        height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                    />
                </Card>
            </GridItem>
        </Grid>
    );
};

export default Addresses;

function isTcp(protocolSelected: AvailableProtocols) {
    return protocolSelected === AvailableProtocols.Tcp;
}

function generateColumns(protocol: AvailableProtocols) {
    const columns = [
        {
            name: AddressesColumnsNames.Name,
            prop: 'name' as keyof AddressResponse,
            component: 'AddressNameLinkCell',
            width: 35,
        },
        {
            name: isTcp(protocol)
                ? AddressesColumnsNames.TotalFlowPairs
                : AddressesColumnsNames.TotalRequests,
            prop: 'totalFlows' as keyof AddressResponse,
        },
        {
            name: isTcp(protocol)
                ? AddressesColumnsNames.CurrentFlowPairs
                : AddressesColumnsNames.CurrentRequests,
            prop: 'currentFlows' as keyof AddressResponse,
        },
        {
            name: AddressesColumnsNames.TotalConnectors,
            prop: 'connectorCount' as keyof AddressResponse,
        },
    ];

    if (!isTcp(protocol)) {
        return [
            ...columns,
            {
                name: AddressesColumnsNames.Protocol,
                prop: 'protocol' as keyof AddressResponse,
            },
        ];
    }

    return columns;
}
