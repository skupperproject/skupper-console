import React from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { SortDirection } from 'API/REST.enum';

import ProcessesBytesChart from '../components/ProcessesBytesChart';
import ProcessesTable from '../components/ProcessesTable';
import { ProcessesLabels } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const Processes = function () {
    const navigate = useNavigate();

    const options = {
        sortName: 'octetsSent',
        sortDirection: SortDirection.DESC,
        limit: 5,
        offset: 0,
    };

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesProcesses.GetProcesses, options],
        () => RESTApi.fetchProcesses(options),
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

    if (isLoadingProcesses) {
        return <LoadingPage />;
    }

    if (!processes) {
        return null;
    }

    const bytesSent = ProcessesController.getTopProcessGroupsSentSortedByBytes(processes);
    const bytesReceived = ProcessesController.getTopProcessGroupsReceivedSortedByBytes(processes);

    const bytesSentLabels = ProcessesController.getBytesLabels(bytesSent);
    const bytesReceivedLabels = ProcessesController.getBytesLabels(bytesReceived);

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
                <ProcessesTable processes={processes} />
            </GridItem>
        </Grid>
    );
};

export default Processes;
