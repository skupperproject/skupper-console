import React, { FC, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SkSpinner from '@core/components/SkSpinner';
import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { UPDATE_INTERVAL } from 'config';

import TopologyDetails from './Details';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

interface TopologyDeploymentDetailsProps {
    id: string;
}

const TopologyProcessGroupsDetails: FC<TopologyDeploymentDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: deployment, isLoading } = useQuery(
        [QueriesTopology.GetProcessGroupMetrics, id],
        () => TopologyController.getProcessGroupMetrics(id),
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

    if (isLoading) {
        return <SkSpinner />;
    }

    if (!deployment) {
        return null;
    }

    const tcpConnectionsInEntries = Object.values(deployment.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.values(deployment.tcpConnectionsOut);

    const title = `${capitalizeFirstLetter(deployment.name)}`;

    return (
        <TopologyDetails
            identity={deployment.identity}
            name={title}
            link={ProcessGroupsRoutesPaths.ProcessGroups}
            tcpConnectionsInEntries={tcpConnectionsInEntries}
            tcpConnectionsOutEntries={tcpConnectionsOutEntries}
        />
    );
};

export default TopologyProcessGroupsDetails;
