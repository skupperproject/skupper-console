import React, { useEffect, useState } from 'react';

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
import { QueriesNetwork } from '../services/network.enum';
import { OverviewNetworkColumns, OverviewLabels, OverviewLinksColumns } from './Overview.enum';
import { LinkStatsRow, NetworkStatsRow } from './Overview.interfaces';

const Overview = function () {
    const navigate = useNavigate();
    const [networkStats, setNetworkStats] = useState<NetworkStatsRow>();
    const [linksStats, setLinksStats] = useState<LinkStatsRow[]>();

    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data, isLoading } = useQuery(
        QueriesNetwork.GetNetwork,
        NetworkServices.fetchNetworkStats,
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

    useEffect(() => {
        if (data) {
            const networkRows = data.networkStats[0];
            const linksRows = data.routersStats.flatMap(({ connectedTo, name }) =>
                (connectedTo || []).map(
                    ({
                        id,
                        linkCost,
                        name: routerNameLinked,
                        mode,
                        direction,
                        endTime,
                        startTime,
                    }) => ({
                        id: `$link-${id}`,
                        routerNameStart: name,
                        routerNameEnd: routerNameLinked,
                        cost: linkCost,
                        mode,
                        direction,
                        startTime,
                        endTime,
                    }),
                ),
            );

            setLinksStats(linksRows);
            setNetworkStats(networkRows);
        }
    }, [data]);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <Stack hasGutter>
            {networkStats && (
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
                                        {data?.sitesStats.totalSites}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-right"
                                        component={TextVariants.p}
                                    >
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
                                        {data?.serviceStats.totalServices}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-right"
                                        component={TextVariants.p}
                                    >
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
                                        {data?.deploymentsStats.totalDeployments}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-right"
                                        component={TextVariants.p}
                                    >
                                        <Link to={`${DeploymentsRoutesPaths.Overview}`}>
                                            <SearchIcon /> view details
                                        </Link>
                                    </Text>
                                </TextContent>
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}

            <StackItem className="pf-u-py-md">
                {linksStats && (
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
                                    <Th>{OverviewLinksColumns.RouterStart}</Th>
                                    <Th>{OverviewLinksColumns.RouterEnd}</Th>
                                    <Th>{OverviewLinksColumns.Cost}</Th>
                                    <Th>{OverviewLinksColumns.Mode}</Th>
                                </Tr>
                            </Thead>
                            {linksStats?.map((row) => (
                                <Tbody key={row.id}>
                                    <Tr>
                                        <Td dataLabel={OverviewLinksColumns.RouterStart}>
                                            {row.routerNameStart}
                                        </Td>
                                        <Td dataLabel={OverviewLinksColumns.RouterEnd}>
                                            {`${row.routerNameEnd}`}
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
