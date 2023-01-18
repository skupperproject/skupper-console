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

const filterOptionsForCharts = {
    sortName: 'octetsSent',
    sortDirection: SortDirection.DESC,
    limit: 5,
    offset: 0,
};

const Processes = function () {
    const navigate = useNavigate();
    const [filterOptions, setFilterOptions] = useState<RequestOptions>({
        limit: 10,
        offset: 0,
        timeRangeStart: 0,
    });

    const { data: processesChartInfo, isLoading: isLoadingProcessesChartInfo } = useQuery(
        [QueriesProcesses.GetProcessesForChart, filterOptionsForCharts],
        () => RESTApi.fetchProcesses(filterOptionsForCharts),
        {
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesProcesses.GetProcessesFiltered, filterOptions],
        () => RESTApi.fetchProcesses(filterOptions),
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

        return;
    }

    const handleGetFilters = useCallback((params: RequestOptions) => {
        setFilterOptions(params);
    }, []);

    const bytesSent = ProcessesController.getTopProcessGroupsSentSortedByBytes(
        processesChartInfo?.results || [],
    );
    const bytesReceived = ProcessesController.getTopProcessGroupsReceivedSortedByBytes(
        processesChartInfo?.results || [],
    );

    const bytesSentLabels = ProcessesController.getBytesLabels(bytesSent);
    const bytesReceivedLabels = ProcessesController.getBytesLabels(bytesReceived);

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
                        processes={processes?.results || []}
                        rowsCount={processes?.totalCount}
                        onGetFilters={handleGetFilters}
                    />
                </GridItem>
            </Grid>
            {(isLoadingProcesses || isLoadingProcessesChartInfo) && (
                <LoadingPage isFLoating={true} />
            )}
        </>
    );
};

export default Processes;
