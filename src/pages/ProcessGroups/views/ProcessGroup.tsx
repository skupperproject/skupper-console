import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Badge, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { prometheusProcessNameseparator } from '@config/prometheus';
import { getTestsIds } from '@config/testIds';
import SkTable from '@core/components/SkTable';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import { ProcessGroupsLabels, QueriesProcessGroups } from '../ProcessGroups.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'component-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `component-open-metric-sections`;

const ProcessGroup = function () {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || ProcessGroupsLabels.Overview;

  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);
  const [tabSelected, setTabSelected] = useState(type);

  const [{ data: processes }, { data: processGroup }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcessGroups.GetProcessesByProcessGroup, { groupIdentity: processGroupId }],
        queryFn: () => RESTApi.fetchProcesses({ endTime: 0, groupIdentity: processGroupId })
      },
      {
        queryKey: [QueriesProcessGroups.GetProcessGroup, processGroupId],
        queryFn: () => RESTApi.fetchProcessGroup(processGroupId)
      }
    ]
  });

  const handleSelectedFilters = useCallback(
    (filters: SelectedMetricFilters) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processGroupId}`, filters);
    },
    [processGroupId]
  );

  const handleGetExpandedSectionsConfig = useCallback(
    (sections: ExpandedMetricSections) => {
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${processGroupId}`, sections);
    },
    [processGroupId]
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ProcessGroupsLabels);
    setSearchParams({ type: tabIndex as string });
  }

  const processResults = processes.results;
  const serverNameFilters = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));
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
              {!!processGroup.processCount && (
                <Badge isRead key={1}>
                  {processGroup.processCount}
                </Badge>
              )}
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
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.ProcessGroups}&${TopologyURLQueyParams.IdSelected}=${processGroupId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ProcessGroupsLabels.Overview && (
            <Metrics
              key={id}
              defaultOpenSections={{
                ...getDataFromSession<ExpandedMetricSections>(
                  `${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${processGroupId}`
                )
              }}
              defaultMetricFilterValues={{
                sourceProcess: serverNameFilters
                  .map(({ destinationName }) => destinationName)
                  .join(prometheusProcessNameseparator),
                ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processGroupId}`)
              }}
              startTimeLimit={startTime}
              sourceProcesses={serverNameFilters}
              configFilters={{
                sourceSites: { hide: true },
                destSites: { hide: true },
                destinationProcesses: { hide: true },
                sourceProcesses: {
                  disabled: serverNameFilters.length < 2
                }
              }}
              onGetMetricFiltersConfig={handleSelectedFilters}
              onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
            />
          )}

          {tabSelected === ProcessGroupsLabels.Processes && (
            <SkTable
              title={ProcessesLabels.Section}
              columns={processesTableColumns}
              rows={processResults}
              customCells={{
                linkCell: CustomProcessCells.linkCell,
                linkCellSite: CustomProcessCells.linkCellSite
              }}
            />
          )}
        </>
      }
    />
  );
};

export default ProcessGroup;
