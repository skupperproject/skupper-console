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
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { NetworkServices } from '../services';
import { QueriesNetwork } from '../services/network.enum';
import {
    OverviewNetworkColumns,
    OverviewRoutersColumns,
    OverviewLabels,
    OverviewLinksColumns,
} from './Overview.enum';
import { RouterStatsRow, LinkStatsRow, NetworkStatsRow } from './Overview.interfaces';

const Overview = function () {
    const navigate = useNavigate();
    const [networkStats, setNetworkStats] = useState<NetworkStatsRow>();
    const [routersStats, setRoutersStats] = useState<RouterStatsRow[]>();
    const [linksStats, setLinksStats] = useState<LinkStatsRow[]>();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

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

            const routersRow = data.routersStats.map(({ totalBytes, ...rest }) => ({
                ...rest,
                totalBytes: formatBytes(totalBytes),
            }));

            const linksRows = data.routersStats.flatMap(({ connectedTo, name }) =>
                connectedTo.map(({ id, linkCost, name: routerNameLinked, mode, direction }) => ({
                    id: `$link-${id}`,
                    routerNameStart: name,
                    routerNameEnd: routerNameLinked,
                    cost: linkCost,
                    mode,
                    direction,
                })),
            );

            setRoutersStats(routersRow);
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
                            <Card className=" pf-u-p-md" isRounded>
                                <TextContent>
                                    <Text component={TextVariants.small}>
                                        {OverviewNetworkColumns.NumRouters}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-center"
                                        component={TextVariants.h1}
                                    >
                                        {networkStats.totalRouters}
                                    </Text>
                                </TextContent>
                            </Card>
                        </SplitItem>

                        <SplitItem isFilled>
                            <Card className="pf-u-p-md" isRounded>
                                <TextContent>
                                    <Text component={TextVariants.small}>
                                        {OverviewNetworkColumns.NumLinks}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-center"
                                        component={TextVariants.h1}
                                    >
                                        {networkStats.totalLinks}
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
                                        {networkStats.totalVanAddress}
                                    </Text>
                                </TextContent>
                            </Card>
                        </SplitItem>

                        <SplitItem isFilled>
                            <Card className="pf-u-p-md" isRounded>
                                <TextContent>
                                    <Text component={TextVariants.small}>
                                        {OverviewNetworkColumns.NumConnections}
                                    </Text>
                                    <Text
                                        className="pf-u-text-align-center"
                                        component={TextVariants.h1}
                                    >
                                        {networkStats.totalFlows}
                                    </Text>
                                </TextContent>
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}

            <StackItem className="pf-u-py-md">
                <Split hasGutter>
                    {routersStats && (
                        <SplitItem isFilled>
                            <Card>
                                <CardTitle>{OverviewLabels.Routers}</CardTitle>
                                <TableComposable
                                    className="network-table"
                                    aria-label="network table"
                                    variant="compact"
                                    borders={false}
                                    isStriped
                                >
                                    <Thead>
                                        <Tr>
                                            <Th>{OverviewRoutersColumns.Name}</Th>
                                            <Th>{OverviewRoutersColumns.TotalBytes}</Th>
                                            <Th>{OverviewRoutersColumns.NumServices}</Th>
                                            <Th>{OverviewRoutersColumns.NumFLows}</Th>
                                        </Tr>
                                    </Thead>
                                    {routersStats?.map((row) => (
                                        <Tbody key={row.id}>
                                            <Tr>
                                                <Td dataLabel={OverviewRoutersColumns.Name}>
                                                    {row.name}
                                                </Td>
                                                <Td dataLabel={OverviewRoutersColumns.TotalBytes}>
                                                    {`${row.totalBytes}`}
                                                </Td>
                                                <Td dataLabel={OverviewRoutersColumns.NumServices}>
                                                    {`${row.totalVanAddress}`}
                                                </Td>
                                                <Td dataLabel={OverviewRoutersColumns.NumFLows}>
                                                    {`${row.totalFlows}`}
                                                </Td>
                                            </Tr>
                                        </Tbody>
                                    ))}
                                </TableComposable>
                            </Card>
                        </SplitItem>
                    )}
                    {linksStats && (
                        <SplitItem isFilled>
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
                                            <Th>{OverviewLinksColumns.Direction}</Th>
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
                                                <Td dataLabel={OverviewLinksColumns.Direction}>
                                                    {`${row.direction}`}
                                                </Td>
                                            </Tr>
                                        </Tbody>
                                    ))}
                                </TableComposable>
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default Overview;
