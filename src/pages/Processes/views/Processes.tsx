import React, { useCallback, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { SortDirection } from 'API/REST.enum';
import { RequestOptions } from 'API/REST.interfaces';

import ProcessesBytesChart from '../components/ProcessesBytesChart';
import ProcessNameLinkCell from '../components/ProcessesNameLinkCell';
import SiteNameLinkCell from '../components/SiteNameLinkCell';
import { processesTableColumns } from '../Processes.constant';
import { ProcessesLabels } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const BYTES_SENT_PROP = 'octetsSent';
const BYTES_RECEIVED_PROP = 'octetsReceived';

const initBytesSentQueryParams = {
    sortName: BYTES_SENT_PROP,
    sortDirection: SortDirection.DESC,
    limit: 5,
    offset: 0,
};

const initBytesReceivedQueryParams = {
    sortName: BYTES_RECEIVED_PROP,
    sortDirection: SortDirection.DESC,
    limit: 5,
    offset: 0,
};

const initProcessesPaginatedQueryParams = {
    limit: 10,
    offset: 0,
    filter: 'processRole.external',
};

const Processes = function () {
    const navigate = useNavigate();

    const [ProcessesPaginatedQueryParams, setProcessesPaginatedQueryParams] =
        useState<RequestOptions>(initProcessesPaginatedQueryParams);

    const { data: processesByOctetsSentData, isLoading: isLoadingProcessesByOctetsSentData } =
        useQuery(
            [QueriesProcesses.GetProcessesMetrics],
            () => RESTApi.fetchProcesses(initBytesSentQueryParams),
            {
                onError: handleError,
            },
        );

    const {
        data: processesByOctetsReceivedData,
        isLoading: isLoadingProcessesByOctetsReceivedData,
    } = useQuery(
        [QueriesProcesses.GetProcessesMetrics],
        () => RESTApi.fetchProcesses(initBytesReceivedQueryParams),
        {
            onError: handleError,
        },
    );

    const { data: processesData, isLoading: isLoadingProcessesData } = useQuery(
        [QueriesProcesses.GetProcessesPaginated, ProcessesPaginatedQueryParams],
        () => RESTApi.fetchProcesses(ProcessesPaginatedQueryParams),
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
        setProcessesPaginatedQueryParams({ ...initProcessesPaginatedQueryParams, ...params });
    }, []);

    if (!processesData || !processesByOctetsSentData || !processesByOctetsReceivedData) {
        return null;
    }

    const processes = processesData.results || [];

    const { labels: bytesSentLabels, values: bytesSent } =
        ProcessesController.formatProcessesBytesForChart(
            processesByOctetsSentData.results || [],
            BYTES_SENT_PROP,
        );

    const { labels: bytesReceivedLabels, values: bytesReceived } =
        ProcessesController.formatProcessesBytesForChart(
            processesByOctetsReceivedData.results || [],
            BYTES_RECEIVED_PROP,
        );

    return (
        <TransitionPage>
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
                        <SkTable
                            title={ProcessesLabels.Section}
                            titleDescription={ProcessesLabels.Description}
                            columns={processesTableColumns}
                            rows={processes}
                            components={{
                                linkCell: ProcessNameLinkCell,
                                linkCellSite: SiteNameLinkCell,
                            }}
                            rowsCount={processesData?.timeRangeCount}
                            onGetFilters={handleGetFilters}
                        />
                    </GridItem>
                </Grid>

                {(isLoadingProcessesData ||
                    isLoadingProcessesByOctetsSentData ||
                    isLoadingProcessesByOctetsReceivedData) && <LoadingPage isFLoating={true} />}
            </>
        </TransitionPage>
    );
};

export default Processes;
