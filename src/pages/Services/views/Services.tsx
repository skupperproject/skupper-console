import React, { useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ServicesBytesChart from '../components/ServicesBytesChart';
import ServicesTable from '../components/ServicesTable';
import ServicesServices from '../services';
import { Labels } from '../Services.enum';
import { QueriesServices } from '../services/services.enum';

const ServicesOverview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: services, isLoading } = useQuery(
        [QueriesServices.GetServices],
        ServicesServices.getServices,
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

    const servicesSorted = (services || [])
        .sort((a, b) => b.octetsSent - a.octetsSent)
        .slice(0, 10);

    const bytesSent = servicesSorted
        .map(({ name, octetsSent }) => ({
            x: name,
            y: octetsSent,
        }))
        .filter(({ y }) => y);

    const bytesSentLabels = bytesSent.map(({ x, y }) => ({
        name: `${x}: ${formatBytes(y)}`,
    }));

    const bytesReceived = servicesSorted
        .map(({ name, octetsReceived }) => ({
            x: name,
            y: octetsReceived,
        }))
        .filter(({ y }) => y);

    const bytesReceivedLabels = bytesReceived.map(({ x, y }) => ({
        name: `${x} ${formatBytes(y)}`,
    }));

    return (
        <Grid hasGutter>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{Labels.MetricBytesSent}</CardTitle>
                    <ServicesBytesChart bytes={bytesSent} labels={bytesSentLabels} />
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card>
                    <CardTitle>{Labels.MetricBytesSent}</CardTitle>
                    <ServicesBytesChart
                        bytes={bytesReceived}
                        labels={bytesReceivedLabels}
                        themeColor={ChartThemeColor.green}
                    />
                </Card>
            </GridItem>
            <GridItem span={12}>
                <ServicesTable services={services || []} />;
            </GridItem>
        </Grid>
    );
};

export default ServicesOverview;
