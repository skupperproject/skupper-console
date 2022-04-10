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
import TrafficChart from '@pages/Site/views/Overview/components/TrafficChart';
import { ChartThemeColors } from '@pages/Site/views/Overview/components/TrafficChart/TrafficChart.enum';
import { formatBytes } from '@utils/formatBytes';
import { UPDATE_INTERVAL } from 'config';

import {
  MonitoringRoutesPaths,
  OverviewColumns,
  QueriesMonitoring,
  RoutersColumns,
  SectionsStatsLabels,
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

  const { data, isLoading, dataUpdatedAt } = useQuery(
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
    if (data) {
      const vanStatsRow = data.vansStats.map(({ name, totalBytes, ...rest }) => ({
        ...rest,
        totalBytes: formatBytes(totalBytes),
        name: <Link to={`${MonitoringRoutesPaths.Connections}/${name}`}>{name}</Link>,
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
    { property: 'totalBytes', name: RoutersColumns.TotalBytes },
    { property: 'totalVanAddress', name: RoutersColumns.NumServices },
    { property: 'totalFlows', name: RoutersColumns.NumFLows },
  ];
  const VANS_STATS_HEADER = [
    { property: 'name', name: ServicesColumns.Name },
    { property: 'routersAssociated', name: ServicesColumns.RoutersAssociated },
    { property: 'totalBytes', name: ServicesColumns.TotalBytes },
    { property: 'totalDevices', name: ServicesColumns.NumDevices },
    { property: 'totalFlows', name: ServicesColumns.NumFLows },
  ];

  return (
    <>
      <Stack hasGutter>
        {monitoringStats && (
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <Card className=" pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.small}>{OverviewColumns.NumRouters}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalRouters}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>

              <SplitItem isFilled>
                <Card className="pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.small}>{OverviewColumns.NumLinks}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalLinks}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>

              <SplitItem isFilled>
                <Card className="pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.small}>{OverviewColumns.NumServices}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalVanAddress}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>

              <SplitItem isFilled>
                <Card className="pf-u-p-md" isRounded>
                  <TextContent>
                    <Text component={TextVariants.small}>{OverviewColumns.NumConnections}</Text>
                    <Text className="pf-u-text-align-center" component={TextVariants.h1}>
                      {monitoringStats.totalFlows}
                    </Text>
                  </TextContent>
                </Card>
              </SplitItem>
            </Split>
          </StackItem>
        )}

        <StackItem className="pf-u-py-md">
          <Card>
            <Split hasGutter>
              {routersStats && (
                <SplitItem isFilled>
                  <OverviewCard
                    color={SummaryCardColors.Blue}
                    noBorder={true}
                    isPlain={true}
                    columns={ROUTERS_STATS_HEADER}
                    data={routersStats}
                    label={Pluralize(`${SectionsStatsLabels.Router}`, routersStats.length, false)}
                  />
                </SplitItem>
              )}
              {data && (
                <SplitItem>
                  <TrafficChart
                    timestamp={dataUpdatedAt}
                    totalBytesProps={data.routersStats.map((routerStat) => ({
                      name: routerStat.name,
                      totalBytes: routerStat.totalBytes,
                    }))}
                  />
                </SplitItem>
              )}
            </Split>
          </Card>
        </StackItem>

        <StackItem>
          <Card>
            <Split hasGutter>
              {vans && (
                <SplitItem isFilled>
                  <OverviewCard
                    color={SummaryCardColors.Purple}
                    noBorder={true}
                    isPlain={true}
                    columns={VANS_STATS_HEADER}
                    data={vans}
                    label={Pluralize(`${SectionsStatsLabels.Service}`, vans.length, false)}
                  />
                </SplitItem>
              )}
              {data && (
                <SplitItem>
                  <TrafficChart
                    options={{ chartColor: ChartThemeColors.Purple }}
                    timestamp={dataUpdatedAt}
                    totalBytesProps={data.vansStats.map((van) => ({
                      name: van.name,
                      totalBytes: van.totalBytes,
                    }))}
                  />
                </SplitItem>
              )}
            </Split>
          </Card>
        </StackItem>
      </Stack>
      <Outlet />
    </>
  );
};

export default Overview;
