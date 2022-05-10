import React, { useEffect, useState } from 'react';

import { Card, Split, SplitItem } from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import OverviewCard from '@core/components/SummaryCard';
import TrafficChart from '@core/components/TrafficChart';
import { ChartThemeColors } from '@core/components/TrafficChart/TrafficChart.enum';
import { formatBytes } from '@core/utils/formatBytes';
import { VANS_STATS_HEADER } from '@pages/Monitoring/Monitoring.constant';
import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitoringRoutesPaths } from '../../Monitoring.enum';
import { MonitorServices } from '../../services';
import { QueriesMonitoring } from '../../services/services.enum';
import { VanStatsRow } from './Overview.interfaces';

const Overview = function () {
    const navigate = useNavigate();
    const [vans, setVans] = useState<VanStatsRow[]>();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const {
        data: networkStats,
        isLoading,
        dataUpdatedAt,
    } = useQuery(
        QueriesMonitoring.GetMonitoringNetworkStats,
        MonitorServices.fetchMonitoringStats,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: number }) {
        const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    useEffect(() => {
        if (networkStats) {
            const vanStatsRow = networkStats.map(({ name, totalBytes, ...rest }) => ({
                ...rest,
                totalBytes: formatBytes(totalBytes),
                name: <Link to={`${MonitoringRoutesPaths.Connections}/${name}`}>{name}</Link>,
            }));

            setVans(vanStatsRow);
        }
    }, [networkStats]);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <Card data-cy="sk-monitoring-services">
            <Split hasGutter>
                {vans && (
                    <SplitItem isFilled>
                        <OverviewCard
                            noBorder={true}
                            isPlain={true}
                            columns={VANS_STATS_HEADER}
                            data={vans}
                        />
                    </SplitItem>
                )}
                {networkStats && (
                    <SplitItem>
                        <TrafficChart
                            options={{ chartColor: ChartThemeColors.Purple }}
                            timestamp={dataUpdatedAt}
                            totalBytesProps={networkStats.map((van) => ({
                                name: van.name,
                                totalBytes: van.totalBytes,
                            }))}
                        />
                    </SplitItem>
                )}
            </Split>
        </Card>
    );
};

export default Overview;
