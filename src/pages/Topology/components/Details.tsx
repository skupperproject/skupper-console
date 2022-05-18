import React, { FC, useState } from 'react';

import { Card, CardBody, CardTitle, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesServices from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { UPDATE_INTERVAL } from 'config';

interface TopologySiteDetailsProps {
    id?: string;
}

const TopologySiteDetails: FC<TopologySiteDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: site, isLoading } = useQuery(
        [QueriesSites.GetSite, id],
        () => SitesServices.fetchSite(id),
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
        return null;
    }

    if (!site) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.entries(site.httpRequestsReceived);
    const httpRequestsSentEntries = Object.entries(site.httpRequestsSent);
    const tcpConnectionsInEntries = Object.entries(site.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.entries(site.tcpConnectionsOut);

    return (
        <Card isPlain isFullHeight>
            <CardTitle>{site.siteName}</CardTitle>
            <CardBody>
                <TextContent>
                    {(!!httpRequestsSentEntries.length || !!httpRequestsReceivedEntries.length) && (
                        <>
                            <Text component={TextVariants.h2}>HTTP</Text>
                            <Text component={TextVariants.h4}>bytes sent to</Text>
                            <div className="pf-u-ml-md">
                                {httpRequestsSentEntries.map(([siteName, requestsSent]) => (
                                    <Text
                                        component={TextVariants.p}
                                        key={requestsSent.id}
                                    >{`${siteName}: ${formatBytes(requestsSent.bytes_out)}`}</Text>
                                ))}
                            </div>
                            <Text component={TextVariants.h4}>Bytes Received from</Text>
                            <div className="pf-u-ml-md">
                                {httpRequestsReceivedEntries.map(([siteName, requestsSent]) => (
                                    <Text
                                        component={TextVariants.p}
                                        key={requestsSent.id}
                                    >{`${siteName}: ${formatBytes(requestsSent.bytes_out)}`}</Text>
                                ))}
                            </div>
                        </>
                    )}

                    {(!!tcpConnectionsOutEntries.length || !!tcpConnectionsInEntries.length) && (
                        <>
                            <Text component={TextVariants.h2}>TCP</Text>

                            <Text component={TextVariants.h4}>bytes sent to</Text>
                            <div className="pf-u-ml-md">
                                {tcpConnectionsOutEntries.map(([siteName, requestsSent]) => (
                                    <Text
                                        component={TextVariants.p}
                                        key={requestsSent.id}
                                    >{`${siteName}: ${formatBytes(requestsSent.bytes_out)}`}</Text>
                                ))}
                            </div>
                            <Text component={TextVariants.h4}>Bytes Received from</Text>
                            <div className="pf-u-ml-md">
                                {tcpConnectionsInEntries.map(([siteName, requestsSent]) => (
                                    <Text
                                        component={TextVariants.p}
                                        key={requestsSent.id}
                                    >{`${siteName}: ${formatBytes(requestsSent.bytes_out)}`}</Text>
                                ))}
                            </div>
                        </>
                    )}
                </TextContent>
            </CardBody>
        </Card>
    );
};

export default TopologySiteDetails;
