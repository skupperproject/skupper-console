import React, { FC, useState } from 'react';

import { Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesServices from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { UPDATE_INTERVAL } from 'config';

import TopologyDetails from './Details';

const SPINNER_DIAMETER = 80;
interface TopologySiteDetailsProps {
    id: string;
}

const TopologySiteDetails: FC<TopologySiteDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, id],
        () => SitesServices.fetchSite(id),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: traffic, isLoading: isLoadingTraffic } = useQuery(
        [QueriesSites.GetSiteTraffic, id],
        () => SitesServices.fetchTraffic(id),
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

    if (isLoadingSite || isLoadingTraffic) {
        return (
            <Spinner
                diameter={`${SPINNER_DIAMETER}px`}
                style={{
                    position: 'absolute',
                    left: '50%',
                    marginLeft: `-${SPINNER_DIAMETER / 4}px`,
                    top: '50%',
                    marginTop: `-${SPINNER_DIAMETER / 4}px`,
                }}
            />
        );
    }

    if (!site || !traffic) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.values(traffic.httpRequestsReceived);
    const httpRequestsSentEntries = Object.values(traffic.httpRequestsSent);
    const tcpConnectionsInEntries = Object.values(traffic.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.values(traffic.tcpConnectionsOut);

    const title = `${capitalizeFirstLetter(site.siteName)}`;

    return (
        <TopologyDetails
            name={title}
            httpRequestsReceivedEntries={httpRequestsReceivedEntries}
            httpRequestsSentEntries={httpRequestsSentEntries}
            tcpConnectionsInEntries={tcpConnectionsInEntries}
            tcpConnectionsOutEntries={tcpConnectionsOutEntries}
        />
    );
};

export default TopologySiteDetails;
