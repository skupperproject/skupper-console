import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    Flex,
    Pagination,
    Stack,
    StackItem,
    Tab,
    Tabs,
    TabTitleText,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { CONNECTIONS_PAGINATION_SIZE_DEFAULT } from '../Addresses.constants';
import {
    FlowPairDetailsLabels,
    AddressesRoutesPathLabel,
    AddressesRoutesPaths,
} from '../Addresses.enum';
import FlowsPairsTable from '../components/FlowPairsTable';
import AddressProcessesTable from '../components/ProcessesTable';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const FlowsPairs = function () {
    const navigate = useNavigate();
    const { id: address } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [visibleItems, setVisibleItems] = useState<number>(CONNECTIONS_PAGINATION_SIZE_DEFAULT);
    const [vanAddressView, setVanAddressView] = useState<number>(0);

    const addressId = address?.split('@')[1];
    const addressName = address?.split('@')[0];

    const { data: connectionsPaginated, isLoading: isLoadingConnectionsPaginated } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddress, addressId, currentPage, visibleItems],
        () =>
            addressId
                ? AddressesController.getFlowPairsByAddress(addressId, currentPage, visibleItems)
                : null,
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId, currentPage, visibleItems],
        () => (addressId ? AddressesController.getProcessesWithMetricsByAddress(addressId) : null),
        {
            cacheTime: 0,
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

    function handleSetPage(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPage: number,
    ) {
        setCurrentPage(perPage);
    }

    function handlePerPageSelect(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPageSelect: number,
    ) {
        setVisibleItems(perPageSelect);
        setCurrentPage(1);
    }

    function handleTabClick(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: string | number,
    ) {
        setVanAddressView(tabIndex as number);
    }

    if (isLoadingConnectionsPaginated || isLoadingProcesses) {
        return <LoadingPage />;
    }

    if (!connectionsPaginated || !processes) {
        return null;
    }

    const { connections, total } = connectionsPaginated;

    return (
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={AddressesRoutesPaths.Addresses}>
                            {AddressesRoutesPathLabel.Addresses}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{addressName}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <ResourceIcon type="address" />
                    <TextContent>
                        <Text component={TextVariants.h1}>{addressName}</Text>
                    </TextContent>
                </Flex>
            </StackItem>
            <StackItem isFilled>
                <Card isRounded className="pf-u-pt-md">
                    <Tabs activeKey={vanAddressView} onSelect={handleTabClick}>
                        <Tab
                            eventKey={0}
                            title={<TabTitleText>{FlowPairDetailsLabels.Servers}</TabTitleText>}
                        >
                            <AddressProcessesTable processes={processes} />
                        </Tab>
                        <Tab
                            eventKey={1}
                            title={<TabTitleText>{FlowPairDetailsLabels.Connections}</TabTitleText>}
                        >
                            <FlowsPairsTable flowPairs={connections} />
                            {!!connections.length && (
                                <Pagination
                                    className="pf-u-my-xs"
                                    perPageComponent="button"
                                    itemCount={total}
                                    perPage={visibleItems}
                                    page={currentPage}
                                    onSetPage={handleSetPage}
                                    onPerPageSelect={handlePerPageSelect}
                                />
                            )}
                        </Tab>
                    </Tabs>
                </Card>
            </StackItem>
        </Stack>
    );
};

export default FlowsPairs;
