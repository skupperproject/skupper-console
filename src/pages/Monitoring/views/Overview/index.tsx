import React, { useEffect, useState } from 'react';

import {
  Card,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import {
  MonitoringRoutesPaths,
  QueriesMonitoring,
  RoutersColumns,
  ServicesColumns,
} from '../../Monitoring.enum';
import { MonitorServices } from '../../services';
import { MonitoringStats, RoutersStats, VansStats } from '../../services/services.interfaces';

const Pluralize = require('pluralize');

const Overview = function () {
  const navigate = useNavigate();
  const [vans, setVans] = useState<VansStats[]>();
  const [routersStats, setRoutersStats] = useState<RoutersStats[]>();
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats>();

  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading } = useQuery(
    QueriesMonitoring.GetMonitoringStats,
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
    if (data) {
      const vanStatsRow = data.vansStats.map(({ name, totalBytes, ...rest }) => ({
        ...rest,
        totalBytes: formatBytes(totalBytes),
        name: <Link to={`${MonitoringRoutesPaths.Devices}/${name}`}>{name}</Link>,
      }));

      const routersRow = data.routersStats.map(({ totalBytes, ...rest }) => ({
        ...rest,
        totalBytes: formatBytes(totalBytes),
      }));

      setVans(vanStatsRow as any);
      setRoutersStats(routersRow as any);
      setMonitoringStats(data.monitoringStats[0]);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const ROUTERS_STATS_HEADER = [
    { property: 'name', name: RoutersColumns.Name },
    { property: 'totalVanAddress', name: RoutersColumns.NumServices },
    { property: 'totalFlows', name: RoutersColumns.NumFLows },
    { property: 'totalBytes', name: RoutersColumns.TotalBytes },
  ];
  const VANS_STATS_HEADER = [
    { property: 'name', name: ServicesColumns.Name },
    { property: 'totalDevices', name: ServicesColumns.NumDevices },
    { property: 'totalFlows', name: ServicesColumns.NumFLows },
    { property: 'totalBytes', name: ServicesColumns.TotalBytes },
  ];

  return (
    <>
      <Stack hasGutter>
        {monitoringStats && (
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <Card className="pf-u-background-color-200 pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.p}>{RoutersColumns.NumRouters}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      2
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>
              <SplitItem isFilled>
                <Card className="pf-u-background-color-200 pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.p}>{RoutersColumns.NumServices}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalVanAddress / 2}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>
              <SplitItem isFilled>
                <Card className="pf-u-background-color-200 pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.p}>{RoutersColumns.NumFLows}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalFlows}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>
              <SplitItem isFilled>
                <Card className="pf-u-background-color-200 pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.p}>{RoutersColumns.TotalBytes}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {formatBytes(monitoringStats.totalBytes)}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>
            </Split>
          </StackItem>
        )}
        <StackItem className="pf-u-py-xl">
          <Split hasGutter>
            {routersStats && (
              <SplitItem isFilled>
                <OverviewCard
                  columns={ROUTERS_STATS_HEADER}
                  data={routersStats}
                  label={Pluralize('Router', routersStats.length, false)}
                />
              </SplitItem>
            )}

            {vans && (
              <SplitItem isFilled>
                <OverviewCard
                  columns={VANS_STATS_HEADER}
                  data={vans}
                  label={Pluralize('Service', vans.length, false)}
                  color={SummaryCardColors.Blue}
                />
              </SplitItem>
            )}
          </Split>
        </StackItem>
      </Stack>
      <Outlet />
    </>
  );
};

export default Overview;

/**
 *  Converts input bytes in the most appropriate format
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
