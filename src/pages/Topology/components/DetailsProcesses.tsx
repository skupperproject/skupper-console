import React, { FC, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SkSpinner from '@core/components/SkSpinner';
import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { UPDATE_INTERVAL } from 'config';

import TopologyDetails from './Details';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

interface TopologyDeploymentDetailsProps {
    id: string;
}

const TopologyProcessesDetails: FC<TopologyDeploymentDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: processesWithMetrics, isLoading } = useQuery(
        [QueriesTopology.GetProcessMetrics, id],
        () => TopologyController.getProcessMetrics(id),
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
        return <SkSpinner />;
    }

    if (!processesWithMetrics) {
        return null;
    }

    const tcpConnectionsInEntries = processesWithMetrics.tcpConnectionsIn;
    const tcpConnectionsOutEntries = processesWithMetrics.tcpConnectionsOut;

    const title = `${capitalizeFirstLetter(processesWithMetrics.name)}`;

    return (
        <TopologyDetails
            identity={processesWithMetrics.identity}
            name={title}
            link={ProcessesRoutesPaths.Processes}
            tcpConnectionsInEntries={tcpConnectionsInEntries}
            tcpConnectionsOutEntries={tcpConnectionsOutEntries}
        />
    );
};

export default TopologyProcessesDetails;
