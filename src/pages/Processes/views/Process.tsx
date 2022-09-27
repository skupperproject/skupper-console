import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
    const navigate = useNavigate();
    const { id: processId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: process, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcesses.GetProcess, processId],
        () => ProcessesController.getProcess(processId),
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

    if (isLoadingProcess) {
        return <LoadingPage />;
    }

    return <div>process</div>;
};

export default Process;
