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
import {
  LINKS_STATS_HEADER,
  ROUTERS_STATS_HEADER,
  VANS_STATS_HEADER,
} from '@pages/Monitoring/Monitoring.constant';
import TrafficChart from '@pages/Site/views/Overview/components/TrafficChart';
import { ChartThemeColors } from '@pages/Site/views/Overview/components/TrafficChart/TrafficChart.enum';
import { formatBytes } from '@utils/formatBytes';
import { UPDATE_INTERVAL } from 'config';

import {
  MonitoringRoutesPaths,
  OverviewColumns,
  QueriesMonitoring,
  SectionsStatsLabels,
} from '../../Monitoring.enum';
import { MonitorServices } from '../../services';
import { MonitoringStats } from '../../services/services.interfaces';
import { RouterStatsRow, VanStatsRow, LinkStatsRow } from './Overview.interfaces';

const Pluralize = require('pluralize');

const Overview = function () {
  const navigate = useNavigate();
  const [vans, setVans] = useState<VanStatsRow[]>();
  const [routersStats, setRoutersStats] = useState<RouterStatsRow[]>();
  const [linksStats, setLinksStats] = useState<LinkStatsRow[]>();
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

      const linksRows = data.routersStats.flatMap(({ connectedTo, name }) =>
        connectedTo.map(({ linkCost, name: routerNameLinked, mode, direction }) => ({
          routerNameStart: name,
          routerNameEnd: routerNameLinked,
          cost: linkCost,
          mode,
          direction,
        })),
      );

      setVans(vanStatsRow);
      setRoutersStats(routersRow);
      setLinksStats(linksRows);
      setMonitoringStats(data.monitoringStats[0]);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingPage />;
  }

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
          <Split hasGutter>
            {routersStats && (
              <SplitItem isFilled>
                <Card>
                  <OverviewCard
                    color={SummaryCardColors.Blue}
                    noBorder={true}
                    isPlain={true}
                    columns={ROUTERS_STATS_HEADER}
                    data={routersStats}
                    label={Pluralize(`${SectionsStatsLabels.Router}`, routersStats.length, false)}
                  />
                </Card>
              </SplitItem>
            )}
            {linksStats && (
              <SplitItem isFilled>
                <Card>
                  <OverviewCard
                    color={SummaryCardColors.Green}
                    noBorder={true}
                    isPlain={true}
                    columns={LINKS_STATS_HEADER}
                    data={linksStats}
                    label={Pluralize(`${SectionsStatsLabels.Link}`, linksStats.length, false)}
                  />
                </Card>
              </SplitItem>
            )}
          </Split>
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
