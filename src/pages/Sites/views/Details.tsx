import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
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
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { SitesColumns } from '../components/SitesTable.enum';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import { SiteRoutesPaths, SitesRoutesPathLabel } from '../sites.enum';
import { SiteDetailsColumns, SiteDetailsColumnsLabels, SitesLabel } from './Details.enum';

const SiteDetail = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: site, isLoading } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => SitesServices.fetchSite(siteId),
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

    if (!site) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.entries(site.httpRequestsReceived);
    const httpRequestsSentEntries = Object.entries(site.httpRequestsSent);
    const tcpConnectionsInEntries = Object.entries(site.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.entries(site.tcpConnectionsOut);

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={SiteRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{site.siteName}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <TextContent>
                <Text component={TextVariants.h1} className=" pf-u-font-weight-bold">
                    <span className="sk-resource-icon sk-resource-site">S</span>
                    {site.siteName}
                </Text>
            </TextContent>

            <TextContent>
                <Text component={TextVariants.h2}>{SitesLabel.Details}</Text>
            </TextContent>

            <Split>
                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesColumns.Name}</div>
                        <span>{site.siteName}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesColumns.Namespace}</div>
                        <span>{site.namespace}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesColumns.Version}</div>
                        <span>{site.version}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesColumns.Edge}</div>
                        <span>{site.edge ? 'Yes' : 'No'}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesColumns.Gateway}</div>
                        <span>{site.gateway ? 'Yes' : 'No'}</span>
                    </div>
                </SplitItem>

                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="pf-u-font-weight-bold">{SitesColumns.RouterHostname}</div>
                        <span>{site.url}</span>
                    </div>
                </SplitItem>
            </Split>

            {httpRequestsReceivedEntries.length !== 0 && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{SiteDetailsColumnsLabels.HTTPrequestsIn}</CardTitle>
                        <TableComposable
                            className="network-table"
                            aria-label="network table"
                            borders={false}
                            variant="compact"
                            isStriped
                        >
                            <Thead>
                                <Tr>
                                    <Th>{SiteDetailsColumns.Name}</Th>
                                    <Th>{SiteDetailsColumns.Requests}</Th>
                                    <Th>{SiteDetailsColumns.MaxLatency}</Th>
                                    <Th>
                                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                        {SiteDetailsColumns.BytesIn}
                                    </Th>
                                    <Th>
                                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                        {SiteDetailsColumns.BytesOut}
                                    </Th>
                                </Tr>
                            </Thead>
                            {httpRequestsReceivedEntries.map(([siteName, requestReceived]) => (
                                <Tbody key={siteName}>
                                    <Tr>
                                        <Td dataLabel={SiteDetailsColumns.Name}>{`${siteName}`}</Td>
                                        <Td dataLabel={SiteDetailsColumns.Requests}>
                                            {`${requestReceived.requests}`}
                                        </Td>
                                        <Td dataLabel={SiteDetailsColumns.MaxLatency}>
                                            {`${formatTime(requestReceived.latency_max, {
                                                startSize: 'ms',
                                            })}`}
                                        </Td>
                                        <Td dataLabel={SiteDetailsColumns.BytesIn}>
                                            {`${formatBytes(requestReceived.bytes_in)}`}
                                        </Td>
                                        <Td dataLabel={SiteDetailsColumns.BytesOut}>
                                            {`${formatBytes(requestReceived.bytes_out)}`}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ))}
                        </TableComposable>
                    </Card>
                </StackItem>
            )}
            {httpRequestsSentEntries.length !== 0 && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{SiteDetailsColumnsLabels.HTTPrequestsOut}</CardTitle>
                        <TableComposable
                            className="network-table"
                            aria-label="network table"
                            borders={false}
                            variant="compact"
                            isStriped
                        >
                            <Thead>
                                <Tr>
                                    <Th>{SiteDetailsColumns.Name}</Th>
                                    <Th>{SiteDetailsColumns.Requests}</Th>
                                    <Th>{SiteDetailsColumns.MaxLatency}</Th>
                                    <Th>
                                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                        {SiteDetailsColumns.BytesIn}
                                    </Th>
                                    <Th>
                                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                        {SiteDetailsColumns.BytesOut}
                                    </Th>
                                </Tr>
                            </Thead>
                            {httpRequestsSentEntries.map(([siteName, requestSent]) => (
                                <Tbody key={siteName}>
                                    <Tr>
                                        <Td dataLabel={SiteDetailsColumns.Name}>{`${siteName}`}</Td>
                                        <Td
                                            dataLabel={SiteDetailsColumns.Requests}
                                        >{`${requestSent.requests}`}</Td>
                                        <Td dataLabel={SiteDetailsColumns.MaxLatency}>
                                            {`${formatTime(requestSent.latency_max, {
                                                startSize: 'ms',
                                            })}`}
                                        </Td>
                                        <Td dataLabel={SiteDetailsColumns.BytesIn}>
                                            {`${formatBytes(requestSent.bytes_in)}`}
                                        </Td>
                                        <Td dataLabel={SiteDetailsColumns.BytesOut}>
                                            {`${formatBytes(requestSent.bytes_out)}`}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ))}
                        </TableComposable>
                    </Card>
                </StackItem>
            )}

            <StackItem>
                <Split hasGutter>
                    {tcpConnectionsInEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{SiteDetailsColumnsLabels.TCPconnectionsIn}</CardTitle>
                                <TableComposable
                                    className="network-table"
                                    aria-label="network table"
                                    borders={false}
                                    variant="compact"
                                    isStriped
                                >
                                    <Thead>
                                        <Tr>
                                            <Th>{SiteDetailsColumns.Name}</Th>
                                            <Th>{SiteDetailsColumns.Ip}</Th>
                                            <Th>
                                                <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                                {SiteDetailsColumns.BytesIn}
                                            </Th>
                                            <Th>
                                                <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                                {SiteDetailsColumns.BytesOut}
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    {tcpConnectionsInEntries.map(([siteName, tcpConnectionsIn]) => (
                                        <Tbody key={siteName}>
                                            <Tr>
                                                <Td
                                                    dataLabel={SiteDetailsColumns.Name}
                                                >{`${siteName}`}</Td>
                                                <Td dataLabel={SiteDetailsColumns.Ip}>{`${
                                                    tcpConnectionsIn.id.split('@')[0]
                                                }`}</Td>
                                                <Td
                                                    dataLabel={SiteDetailsColumns.BytesIn}
                                                >{`${formatBytes(tcpConnectionsIn.bytes_in)}`}</Td>
                                                <Td
                                                    dataLabel={SiteDetailsColumns.BytesOut}
                                                >{`${formatBytes(tcpConnectionsIn.bytes_out)}`}</Td>
                                            </Tr>
                                        </Tbody>
                                    ))}
                                </TableComposable>
                            </Card>
                        </SplitItem>
                    )}
                    {tcpConnectionsOutEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{SiteDetailsColumnsLabels.TCPconnectionsOut}</CardTitle>
                                <TableComposable
                                    className="network-table"
                                    aria-label="network table"
                                    borders={false}
                                    variant="compact"
                                    isStriped
                                >
                                    <Thead>
                                        <Tr>
                                            <Th>{SiteDetailsColumns.Name}</Th>
                                            <Th>{SiteDetailsColumns.Ip}</Th>
                                            <Th>
                                                <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                                {SiteDetailsColumns.BytesIn}
                                            </Th>
                                            <Th>
                                                <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                                {SiteDetailsColumns.BytesOut}
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    {tcpConnectionsOutEntries.map(
                                        ([siteName, tcpConnectionsIn]) => (
                                            <Tbody key={siteName}>
                                                <Tr>
                                                    <Td
                                                        dataLabel={SiteDetailsColumns.Name}
                                                    >{`${siteName}`}</Td>
                                                    <Td dataLabel={SiteDetailsColumns.Ip}>{`${
                                                        tcpConnectionsIn.id.split('@')[0]
                                                    }`}</Td>
                                                    <Td
                                                        dataLabel={SiteDetailsColumns.BytesIn}
                                                    >{`${formatBytes(
                                                        tcpConnectionsIn.bytes_in,
                                                    )}`}</Td>
                                                    <Td
                                                        dataLabel={SiteDetailsColumns.BytesOut}
                                                    >{`${formatBytes(
                                                        tcpConnectionsIn.bytes_out,
                                                    )}`}</Td>
                                                </Tr>
                                            </Tbody>
                                        ),
                                    )}
                                </TableComposable>
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default SiteDetail;
