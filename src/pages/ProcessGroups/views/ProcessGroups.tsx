import React from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';

import ProcessesBytesChart from '../components/ProcessGroupsBytesChart';
import ProcessGroupsTable from '../components/ProcessGroupsTable';
import { ProcessGroupsLabels } from '../ProcessGroups.enum';
import ProcessGroupsController from '../services';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroups = function () {
    const navigate = useNavigate();

    const { data: processGroups, isLoading } = useQuery(
        [QueriesProcessGroups.GetProcessGroups],
        () => RESTApi.fetchProcessGroups(),
        {
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        navigate(route);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!processGroups) {
        return null;
    }

    const bytesSent = ProcessGroupsController.getTop10processGroupsSentSortedByBytes(processGroups);
    const bytesReceived =
        ProcessGroupsController.getTop10processGroupsReceivedSortedByBytes(processGroups);

    const bytesSentLabels = ProcessGroupsController.getBytesLabels(bytesSent);
    const bytesReceivedLabels = ProcessGroupsController.getBytesLabels(bytesReceived);

    return (
        <Grid hasGutter>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{ProcessGroupsLabels.MetricBytesSent}</CardTitle>
                    <ProcessesBytesChart bytes={bytesSent} labels={bytesSentLabels} />
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{ProcessGroupsLabels.MetricBytesReceived}</CardTitle>
                    <ProcessesBytesChart
                        bytes={bytesReceived}
                        labels={bytesReceivedLabels}
                        themeColor={ChartThemeColor.green}
                    />
                </Card>
            </GridItem>
            <GridItem span={12}>
                <ProcessGroupsTable processGroups={processGroups || []} />
            </GridItem>
        </Grid>
    );
};

export default ProcessGroups;
