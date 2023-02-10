import React, { useCallback, useState } from 'react';

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
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { AddressResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import { AddressesColumnsNames, AddressesLabels, AddressesRoutesPaths } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 360;

const Addresses = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: addresses, isLoading } = useQuery(
        [QueriesAddresses.GetAddresses],
        () => RESTApi.fetchAddresses(),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    const AddressNameLinkCell = useCallback(
        (props: LinkCellProps<AddressResponse>) =>
            LinkCell({
                ...props,
                isDisabled: !props.data.totalFlows,
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
    }, {} as Record<string, { name: string; x: string; y: number }>);

    const topTrafficUpload = Object.values(topTrafficUploadByClient);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <TransitionPage>
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

                <GridItem>
                    <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                        <CardTitle>{AddressesLabels.ProtocolDistribution}</CardTitle>
                        <ChartPie
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
                            themeColor={ChartThemeColors.Multi}
                        />
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card isFullHeight>
                        <SkTable
                            title={AddressesLabels.TCP}
                            columns={generateColumns(AvailableProtocols.Tcp)}
                            rows={sortedAddressesTCP}
                            pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                            components={{ AddressNameLinkCell }}
                        />
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card isFullHeight>
                        <SkTable
                            title={AddressesLabels.HTTP}
                            columns={generateColumns(AvailableProtocols.Http)}
                            pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                            rows={sortedAddressesHTTP}
                            components={{ AddressNameLinkCell }}
                        />
                    </Card>
                </GridItem>
            </Grid>
        </TransitionPage>
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
