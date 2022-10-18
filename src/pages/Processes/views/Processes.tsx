import React from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { ProcessResponse } from 'API/REST.interfaces';

import ProcessesBytesChart from '../components/ProcessesBytesChart';
import ProcessesTable from '../components/ProcessesTable';
import { ProcessesLabels } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const Processes = function () {
    const navigate = useNavigate();

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesProcesses.GetProcesses],
        ProcessesController.getProcesses,
        {
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites],
        SitesController.getSites,
        {
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route =
            httpStatus && ErrorRoutesPaths.error[httpStatus]
                ? ErrorRoutesPaths.error[httpStatus]
                : ErrorRoutesPaths.ErrConnection;

        navigate(route, { state: { httpStatus } });

        return;
    }

    if (isLoadingProcesses || isLoadingSites) {
        return <LoadingPage />;
    }

    if (!sites || !processes) {
        return null;
    }

    const top10processesSentSorted = (processes as ProcessResponse[])
        .sort((a, b) => b.octetsSent - a.octetsSent)
        .slice(0, 10);

    const top10processesReceivedSorted = (processes as ProcessResponse[])
        .sort((a, b) => b.octetsReceived - a.octetsReceived)
        .slice(0, 10);

    const bytesSent = top10processesSentSorted
        .map(({ name, octetsSent }) => ({
            x: name,
            y: octetsSent,
        }))
        .filter(({ y }) => y);

    const bytesSentLabels = bytesSent.map(({ x, y }) => ({
        name: `${x}: ${formatBytes(y)}`,
    }));

    const bytesReceived = top10processesReceivedSorted
        .map(({ name, octetsReceived }) => ({
            x: name,
            y: octetsReceived,
        }))
        .filter(({ y }) => y);

    const bytesReceivedLabels = bytesReceived.map(({ x, y }) => ({
        name: `${x}: ${formatBytes(y)}`,
    }));

    return (
        <Grid hasGutter>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{ProcessesLabels.MetricBytesSent}</CardTitle>
                    <ProcessesBytesChart bytes={bytesSent} labels={bytesSentLabels} />
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{ProcessesLabels.MetricBytesReceived}</CardTitle>
                    <ProcessesBytesChart
                        bytes={bytesReceived}
                        labels={bytesReceivedLabels}
                        themeColor={ChartThemeColor.green}
                    />
                </Card>
            </GridItem>
            <GridItem span={12}>
                <ProcessesTable
                    processes={ProcessesController.getProcessesExtended(sites, processes)}
                />
            </GridItem>
        </Grid>
    );
};

export default Processes;
