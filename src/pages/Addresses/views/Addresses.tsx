import React, { useState } from 'react';

import { ChartPie } from '@patternfly/react-charts';
import {
    Card,
    CardTitle,
    Flex,
    Grid,
    GridItem,
    Select,
    SelectOption,
    SelectOptionObject,
    Text,
    TextContent,
    TextVariants,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import SkTable from '@core/components/SkTable';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { protocols } from 'API/REST.constant';
import { AvailableProtocols } from 'API/REST.enum';
import { AddressResponse } from 'API/REST.interfaces';
import { UPDATE_INTERVAL } from 'config';

import { AddressesColumnsNames, AddressesLabels, AddressesRoutesPaths } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 350;
const ITEM_DISPLAY_COUNT = 5;

const Addresses = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [protocolSelected, setProtocol] = useState<AvailableProtocols>(protocols[0].name);

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

    function handleToggle(isSelectOpen: boolean) {
        setIsOpen(isSelectOpen);
    }

    function handleSelect(
        _: React.MouseEvent | React.ChangeEvent,
        selection: string | SelectOptionObject,
    ) {
        setProtocol(selection as AvailableProtocols);
        setIsOpen(false);
    }

    if (isLoading || !addresses) {
        return <LoadingPage />;
    }
    const addressesWithFlowPairsCounts = AddressesController.getAddressesWithFlowPairsCounts(
        addresses.filter(({ protocol }) => protocol === protocolSelected),
    );

    const sortedAddresses = addressesWithFlowPairsCounts.sort(
        (a, b) => b.currentFlows - a.currentFlows,
    );

    const topCurrentConnectionsChartData = sortedAddresses
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

    const ActiveConnectionsChartData = topCurrentConnectionsChartData.reduce(
        (acc, address) => acc + address.value,
        0,
    );

    const options = protocols?.map(({ name, identity }) => (
        <SelectOption key={identity} value={name}>
            {name}
        </SelectOption>
    ));

    return (
        <Grid hasGutter data-cy="sk-addresses">
            <GridItem>
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarItem>
                            <Flex>
                                <TextContent>
                                    <Text component={TextVariants.h1}>
                                        {AddressesLabels.Section}
                                    </Text>
                                </TextContent>
                                <Tooltip position="right" content={AddressesLabels.Description}>
                                    <OutlinedQuestionCircleIcon />
                                </Tooltip>
                            </Flex>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Select
                                isOpen={isOpen}
                                onSelect={handleSelect}
                                onToggle={handleToggle}
                                selections={protocolSelected}
                            >
                                {options}
                            </Select>
                        </ToolbarItem>
                    </ToolbarContent>
                </Toolbar>
            </GridItem>
            <GridItem>
                <SkTable
                    title={AddressesLabels.Section}
                    titleDescription={AddressesLabels.Description}
                    columns={generateColumns(protocolSelected)}
                    rows={sortedAddresses}
                    components={{
                        AddressNameLinkCell: (props: LinkCellProps<AddressResponse>) =>
                            LinkCell({
                                ...props,
                                type: 'address',
                                link: `${AddressesRoutesPaths.Addresses}/${props.data.name}@${props.data.identity}@${props.data.protocol}`,
                            }),
                    }}
                />
            </GridItem>

            <GridItem span={8}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>
                        {isTcp(protocolSelected)
                            ? AddressesLabels.CurrentConnections
                            : AddressesLabels.CurrentRequests}
                    </CardTitle>
                    {topCurrentConnectionsChartData?.length ? (
                        <RealTimeLineChart
                            options={{
                                height: REAL_TIME_CONNECTION_HEIGHT_CHART,
                                padding: {
                                    top: 0,
                                    bottom: 50,
                                    left: 50,
                                    right: 20,
                                },
                            }}
                            data={[{ name: 'Connections', value: ActiveConnectionsChartData }]}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>
            <GridItem span={4}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>
                        {isTcp(protocolSelected)
                            ? AddressesLabels.ConnectionsByAddress
                            : AddressesLabels.RequestsByAddress}
                    </CardTitle>
                    <ChartPie
                        constrainToVisibleArea
                        data={topCurrentConnectionsChartData?.map(({ name, value }) => ({
                            x: name,
                            y: value,
                        }))}
                        labels={topCurrentConnectionsChartData?.map(
                            ({ name, value }) => `${name}: ${value}`,
                        )}
                        padding={{
                            bottom: 100,
                            left: -100,
                            right: 100,
                            top: 0,
                        }}
                        legendData={topCurrentConnectionsChartData?.map(({ name }) => ({ name }))}
                        legendOrientation="vertical"
                        legendPosition="right"
                        themeColor={ChartThemeColors.Multi}
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
    return [
        {
            name: AddressesColumnsNames.Name,
            prop: 'name' as keyof AddressResponse,
            component: 'AddressNameLinkCell',
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
}
