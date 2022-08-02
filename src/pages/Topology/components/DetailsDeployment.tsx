import React, { FC, useState } from 'react';

import { Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import DeploymentsServices from '@pages/Deployments/services';
import { QueriesDeployments } from '@pages/Deployments/services/deployments.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { UPDATE_INTERVAL } from 'config';

import TopologyDetails from './Details';

const SPINNER_DIAMETER = 80;

interface TopologyDeploymentDetailsProps {
    id?: string;
}

const TopologyDeploymentDetails: FC<TopologyDeploymentDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: deployment, isLoading } = useQuery(
        [QueriesDeployments.GetDeployments, id],
        () => DeploymentsServices.fetchDeployment(id),
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

    if (!deployment) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.values(deployment.httpRequestsReceived);
    const httpRequestsSentEntries = Object.values(deployment.httpRequestsSent);
    const tcpConnectionsInEntries = Object.values(deployment.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.values(deployment.tcpConnectionsOut);

    const title = `${capitalizeFirstLetter(deployment.site.site_name)} / ${capitalizeFirstLetter(
        deployment.service.address,
    )}`;

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

export default TopologyDeploymentDetails;
