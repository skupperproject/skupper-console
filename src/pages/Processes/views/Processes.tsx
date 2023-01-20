import React, { useCallback, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { SortDirection } from 'API/REST.enum';
import { RequestOptions } from 'API/REST.interfaces';

import ProcessesBytesChart from '../components/ProcessesBytesChart';
import ProcessesTable from '../components/ProcessesTable';
import { ProcessesLabels } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const BYTES_SENT_PROP = 'octetsSent';
const BYTES_RECEIVED_PROP = 'octetsReceived';

const bytesSentQueryString = {
    sortName: BYTES_SENT_PROP,
    sortDirection: SortDirection.DESC,
    limit: 5,
    offset: 0,
};

const bytesReceivedQueryString = {
    sortName: BYTES_RECEIVED_PROP,
    sortDirection: SortDirection.DESC,
    limit: 5,
    offset: 0,
};

const processesPaginatedQueryString = {
    limit: 10,
    offset: 0,
    filter: 'processRole.external',
};

const Processes = function () {
    const navigate = useNavigate();

    const [ProcessesPaginatedQueryString, setProcessesPaginatedQueryString] =
        useState<RequestOptions>(processesPaginatedQueryString);

    const { data: processesByOctetsSentData, isLoading: isLoadingProcessesByOctetsSentData } =
        useQuery(
            [QueriesProcesses.GetProcessesMetrics, bytesSentQueryString],
            () => RESTApi.fetchProcesses(bytesSentQueryString),
            {
                onError: handleError,
            },
        );

    const {
        data: processesByOctetsReceivedData,
        isLoading: isLoadingProcessesByOctetsReceivedData,
    } = useQuery(
        [QueriesProcesses.GetProcessesMetrics, bytesReceivedQueryString],
        () => RESTApi.fetchProcesses(bytesReceivedQueryString),
        {
            onError: handleError,
        },
    );

    const { data: processesData, isLoading: isLoadingProcessesData } = useQuery(
        [QueriesProcesses.GetProcessesPaginated, ProcessesPaginatedQueryString],
        () => RESTApi.fetchProcesses(ProcessesPaginatedQueryString),
        {
            keepPreviousData: true,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route =
            httpStatus && ErrorRoutesPaths.error[httpStatus]
                ? ErrorRoutesPaths.error[httpStatus]
                : ErrorRoutesPaths.ErrConnection;

        navigate(route, { state: { httpStatus } });
    }

    const handleGetFilters = useCallback((params: RequestOptions) => {
        setProcessesPaginatedQueryString({ ...processesPaginatedQueryString, ...params });
    }, []);

    const processes = processesData?.results || [];

    const { labels: bytesSentLabels, values: bytesSent } =
        ProcessesController.formatProcessesBytesForChart(
            processesByOctetsSentData?.results || [],
            BYTES_SENT_PROP,
        );

    const { labels: bytesReceivedLabels, values: bytesReceived } =
        ProcessesController.formatProcessesBytesForChart(
            processesByOctetsReceivedData?.results || [],
            BYTES_RECEIVED_PROP,
        );

    return (
        <>
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
                        processes={processes}
                        rowsCount={processesData?.timeRangeCount}
                        onGetFilters={handleGetFilters}
                    />
                </GridItem>
            </Grid>

            {(isLoadingProcessesData ||
                isLoadingProcessesByOctetsSentData ||
                isLoadingProcessesByOctetsReceivedData) && <LoadingPage isFLoating={true} />}
        </>
    );
};

export default Processes;
