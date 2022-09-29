import React, { useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ProcessesBytesChart from '../components/ProcessGroupsBytesChart';
import ProcessGroupsTable from '../components/ProcessGroupsTable';
import { ProcessGroupsLabels } from '../ProcessGroups.enum';
import ServicesServices from '../services';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroups = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: processGroups, isLoading } = useQuery(
        [QueriesProcessGroups.GetProcessGroups],
        ServicesServices.getProcessGroups,
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
        return <LoadingPage />;
    }

    const top10processGroupsSentSorted = (processGroups || [])
        .sort((a, b) => b.octetsSent - a.octetsSent)
        .slice(0, 10);

    const top10processGroupsReceivedSorted = (processGroups || [])
        .sort((a, b) => b.octetsReceived - a.octetsReceived)
        .slice(0, 10);

    const bytesSent = top10processGroupsSentSorted
        .map(({ name, octetsSent }) => ({
            x: name,
            y: octetsSent,
        }))
        .filter(({ y }) => y);

    const bytesSentLabels = bytesSent.map(({ x, y }) => ({
        name: `${x}: ${formatBytes(y)}`,
    }));

    const bytesReceived = top10processGroupsReceivedSorted
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
                    <CardTitle>{ProcessGroupsLabels.MetricBytesSent}</CardTitle>
                    <ProcessesBytesChart bytes={bytesSent} labels={bytesSentLabels} />
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{ProcessGroupsLabels.MetricBytesSent}</CardTitle>
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
