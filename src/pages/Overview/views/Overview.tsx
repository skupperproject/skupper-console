import React, { useState } from 'react';

import {
    Card,
    CardTitle,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { SitesRoutesPaths } from '@pages/Sites/sites.enum';

import { NetworkServices } from '../services';
import { QueriesOverview } from '../services/overview.enum';
import { OverviewNetworkColumns, OverviewLabels, OverviewLinksColumns } from './Overview.enum';

const Overview = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data, isLoading } = useQuery(
        QueriesOverview.GetOverview,
        NetworkServices.fetchOverviewStats,
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

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <Stack hasGutter>
            <StackItem>
                <Split hasGutter>
                    <SplitItem isFilled>
                        <Card className="pf-u-p-md" isRounded>
                            <TextContent>
                                <Text component={TextVariants.small}>
                                    {OverviewNetworkColumns.NumSites}
                                </Text>
                                <Text
                                    className="pf-u-text-align-center"
                                    component={TextVariants.h1}
                                >
                                    {data?.sitesStats.totalSites || 0}
                                </Text>
                                <Text className="pf-u-text-align-right" component={TextVariants.p}>
                                    <Link to={`${SitesRoutesPaths.Overview}`}>
                                        <SearchIcon /> view details
                                    </Link>
                                </Text>
                            </TextContent>
                        </Card>
                    </SplitItem>

                    <SplitItem isFilled>
                        <Card className="pf-u-p-md" isRounded>
                            <TextContent>
                                <Text component={TextVariants.small}>
                                    {OverviewNetworkColumns.NumServices}
                                </Text>
                                <Text
                                    className="pf-u-text-align-center"
                                    component={TextVariants.h1}
                                >
                                    {data?.serviceStats.totalServices || 0}
                                </Text>
                                <Text className="pf-u-text-align-right" component={TextVariants.p}>
                                    <Link to={`${ServicesRoutesPaths.Overview}`}>
                                        <SearchIcon /> view details
                                    </Link>
                                </Text>
                            </TextContent>
                        </Card>
                    </SplitItem>

                    <SplitItem isFilled>
                        <Card className="pf-u-p-md" isRounded>
                            <TextContent>
                                <Text component={TextVariants.small}>
                                    {OverviewNetworkColumns.NumDeployments}
                                </Text>
                                <Text
                                    className="pf-u-text-align-center"
                                    component={TextVariants.h1}
                                >
                                    {data?.deploymentsStats.totalDeployments || 0}
                                </Text>
                                <Text className="pf-u-text-align-right" component={TextVariants.p}>
                                    <Link to={`${DeploymentsRoutesPaths.Overview}`}>
                                        <SearchIcon /> view details
                                    </Link>
                                </Text>
                            </TextContent>
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>

            <StackItem className="pf-u-py-md">
                {data?.linksRouters && (
                    <Card>
                        <CardTitle>{OverviewLabels.Links}</CardTitle>
                        <TableComposable
                            className="network-table"
                            aria-label="network table"
                            variant="compact"
                            borders={false}
                            isStriped
                        >
                            <Thead>
                                <Tr>
                                    <Th>{OverviewLinksColumns.Source}</Th>
                                    <Th>{OverviewLinksColumns.Target}</Th>
                                    <Th>{OverviewLinksColumns.Cost}</Th>
                                    <Th>{OverviewLinksColumns.Mode}</Th>
                                </Tr>
                            </Thead>
                            {data.linksRouters.map((row) => (
                                <Tbody key={`${row.source}${row.target}`}>
                                    <Tr>
                                        <Td dataLabel={OverviewLinksColumns.Source}>
                                            {row.sourceNamespace}
                                        </Td>
                                        <Td dataLabel={OverviewLinksColumns.Target}>
                                            {row.targetNamespace}
                                        </Td>
                                        <Td dataLabel={OverviewLinksColumns.Cost}>
                                            {`${row.cost}`}
                                        </Td>
                                        <Td dataLabel={OverviewLinksColumns.Mode}>
                                            {`${row.mode}`}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ))}
                        </TableComposable>
                    </Card>
                )}
            </StackItem>
        </Stack>
    );
};

export default Overview;
