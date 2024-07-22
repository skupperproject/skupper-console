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
import { ExpandedMetricSections, QueryMetricsParams } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import { ComponentLabels, QueriesComponent } from '../ProcessGroups.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'component-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `component-open-metric-sections`;

const ProcessGroup = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || ComponentLabels.Overview;

  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);
  const [tabSelected, setTabSelected] = useState(type);

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected, true);

  const [{ data: processes }, { data: processGroup }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetProcessesByProcessGroup, { groupIdentity: processGroupId }],
        queryFn: () => RESTApi.fetchProcesses({ endTime: 0, groupIdentity: processGroupId })
      },
      {
        queryKey: [QueriesComponent.GetProcessGroup, processGroupId],
        queryFn: () => RESTApi.fetchProcessGroup(processGroupId)
      }
    ]
  });

  const handleSelectedFilters = useCallback(
    (filters: QueryMetricsParams) => {
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
    setTabSelected(tabIndex as ComponentLabels);
  }

  const processResults = processes.results;
  const serverNameFilters = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ComponentLabels.Overview} title={<TabTitleText>{ComponentLabels.Overview}</TabTitleText>} />
        <Tab
          eventKey={ComponentLabels.Processes}
          title={
            <TabTitleText>
              {ComponentLabels.Processes}{' '}
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
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Components}&${TopologyURLQueyParams.IdSelected}=${processGroupId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ComponentLabels.Overview && (
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
                ...getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processGroupId}`)
              }}
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

          {tabSelected === ComponentLabels.Processes && (
            <SkTable
              title={ProcessesLabels.Section}
              columns={processesTableColumns}
              rows={processResults}
              customCells={{
                linkCell: CustomProcessCells.linkCell,
                linkCellSite: CustomProcessCells.linkCellSite,
                TimestampCell: CustomProcessCells.TimestampCell
              }}
            />
          )}
        </>
      }
    />
  );
};

export default ProcessGroup;
