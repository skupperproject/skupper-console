import React, { FC, useState } from 'react';

import { Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { UPDATE_INTERVAL } from 'config';

import { TopologyServices } from '../services';
import { QueriesTopology } from '../services/services.enum';
import TopologyDetails from './Details';

const SPINNER_DIAMETER = 80;

interface TopologyDeploymentDetailsProps {
    id: string;
}

const TopologyDeploymentDetails: FC<TopologyDeploymentDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: deployment, isLoading } = useQuery(
        [QueriesTopology.GetProcesses, id],
        () => TopologyServices.getProcessMetrics(id),
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

    const tcpConnectionsInEntries = Object.values(deployment.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.values(deployment.tcpConnectionsOut);

    const title = `${capitalizeFirstLetter(deployment.name)} / ${capitalizeFirstLetter(
        deployment.name,
    )}`;

    return (
        <TopologyDetails
            name={title}
            tcpConnectionsInEntries={tcpConnectionsInEntries}
            tcpConnectionsOutEntries={tcpConnectionsOutEntries}
        />
    );
};

export default TopologyDeploymentDetails;
