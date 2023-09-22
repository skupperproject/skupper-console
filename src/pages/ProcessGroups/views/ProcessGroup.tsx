import { useCallback, useState, MouseEvent as ReactMouseEvent, Suspense } from 'react';

import { Badge, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds';
import SkTable from '@core/components/SkTable';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import { ProcessGroupsLabels, QueriesProcessGroups } from '../ProcessGroups.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'component-display-interval';

const ProcessGroup = function () {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || ProcessGroupsLabels.Overview;

  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);
  const [tabSelected, setTabSelected] = useState(type);

  const { data: processGroup } = useQuery([QueriesProcessGroups.GetProcessGroup, processGroupId], () =>
    RESTApi.fetchProcessGroup(processGroupId)
  );

  const { data: processes } = useQuery(
    [QueriesProcessGroups.GetProcessesByProcessGroup, { groupIdentity: processGroupId }],
    () => RESTApi.fetchProcesses({ groupIdentity: processGroupId })
  );

  const handleRefreshMetrics = useCallback(
    (filters: SelectedFilters) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processGroupId}`, filters);
    },
    [processGroupId]
  );

  if (!processGroup || !processes) {
    return null;
  }

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ProcessGroupsLabels);
    setSearchParams({ type: tabIndex as string });
  }

  const processResults = processes.results;
  const serverNameFilters = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));
  const serverNames = processResults.map(({ name: processName }) => processName).join('|');
  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab
          eventKey={ProcessGroupsLabels.Overview}
          title={<TabTitleText>{ProcessGroupsLabels.Overview}</TabTitleText>}
        />
        <Tab
          eventKey={ProcessGroupsLabels.Processes}
          title={
            <TabTitleText>
              {ProcessGroupsLabels.Processes}{' '}
              <Badge isRead key={1}>
                {processes.results?.length}
              </Badge>
            </TabTitleText>
          }
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.componentView(processGroupId)}
      title={processGroup.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.ProcessGroups}&${TopologyURLFilters.IdSelected}=${processGroupId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <Suspense fallback={<LoadingPage />}>
          {tabSelected === ProcessGroupsLabels.Overview && (
            <Metrics
              key={id}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processGroupId}`),
                processIdSource: serverNames
              }}
              startTime={startTime}
              sourceProcesses={serverNameFilters}
              filterOptions={{
                destinationProcesses: { hide: true, placeholder: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: {
                  disabled: serverNameFilters.length < 2,
                  placeholder: MetricsLabels.FilterAllSourceProcesses
                }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          )}

          {tabSelected === ProcessGroupsLabels.Processes && (
            <SkTable
              title={ProcessesLabels.Section}
              columns={processesTableColumns}
              rows={processResults}
              customCells={{
                linkCell: CustomProcessCells.linkCell,
                linkCellSite: CustomProcessCells.linkCellSite,
                exposedCell: CustomProcessCells.exposedCell
              }}
            />
          )}
        </Suspense>
      }
    />
  );
};

export default ProcessGroup;
