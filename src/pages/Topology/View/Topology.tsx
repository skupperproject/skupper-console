import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import ProcessesController from '@pages/Processes/services';
import ProcessGroupsController from '@pages/ProcessGroups/services';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { UPDATE_INTERVAL } from 'config';

import TopologySVGContainer from '../components/TopologySVGContainer';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

const TopologyContent = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesTopology.GetSites],
        SitesController.getDataSites,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingServices } = useQuery(
        [QueriesTopology.GetProcesses],
        ProcessesController.getProcesses,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
        [QueriesTopology.GetProcessGroups],
        ProcessGroupsController.getProcessGroups,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processesLinks, isLoading: isLoadingProcessesLinks } = useQuery(
        [QueriesTopology.GetProcessesLinks],
        TopologyController.getProcessesLinks,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processGroupsLinks, isLoading: isLoadingProcessGroupsLinks } = useQuery(
        [QueriesTopology.GetProcessGroupsLinks],
        TopologyController.getProcessGroupsLinks,
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

    if (
        isLoadingSites ||
        isLoadingServices ||
        isLoadingProcessesLinks ||
        isLoadingProcessGroups ||
        isLoadingProcessGroupsLinks
    ) {
        return <LoadingPage />;
    }

    if (!processes || !processesLinks || !sites || !processGroups || !processGroupsLinks) {
        return null;
    }

    const deployments = { processes, processesLinks, processGroups, processGroupsLinks };

    return <TopologySVGContainer sites={sites} deployments={deployments} />;
};

export default TopologyContent;
