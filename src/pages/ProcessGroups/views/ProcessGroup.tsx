import { useCallback } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { isPrometheusActive } from '@config/Prometheus.config';
import { getTestsIds } from '@config/testIds.config';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constant';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import { QueriesProcessGroups } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'component-display-interval';

const ProcessGroup = function () {
  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);

  const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
    [QueriesProcessGroups.GetProcessGroup, processGroupId],
    () => RESTApi.fetchProcessGroup(processGroupId)
  );

  const { data: processes, isLoading: isLoadingProcess } = useQuery(
    [QueriesProcessGroups.GetProcessesByProcessGroup, { groupIdentity: processGroupId }],
    () => RESTApi.fetchProcesses({ groupIdentity: processGroupId })
  );

  const handleRefreshMetrics = useCallback(
    (filters: SelectedFilters) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processGroupId}`, filters);
    },
    [processGroupId]
  );

  if (isLoadingProcessGroup || isLoadingProcess) {
    return <LoadingPage />;
  }

  if (!processGroup || !processes) {
    return null;
  }

  const { name } = processGroup;

  const processResults = processes.results;
  const serverNameFilters = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));
  const serverNames = processResults.map(({ name: processName }) => processName).join('|');
  const startTime = processResults.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  return (
    <TransitionPage>
      <Grid hasGutter data-testid={getTestsIds.componentView(processGroupId)}>
        <SkTitle
          title={name}
          icon="service"
          link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.ProcessGroups}&${TopologyURLFilters.IdSelected}=${processGroupId}`}
        />

        {/* Processes table*/}
        <GridItem span={12}>
          <SkTable
            title={ProcessesLabels.Section}
            titleDescription={ProcessesLabels.Description}
            columns={processesTableColumns}
            rows={processResults}
            customCells={{
              linkCell: ProcessesComponentsTable.linkCell,
              linkCellSite: ProcessesComponentsTable.linkCellSite,
              exposedCell: ProcessesComponentsTable.exposedCell
            }}
          />
        </GridItem>

        {/* Component Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              key={id}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processGroupId}`),
                processIdSource: serverNames
              }}
              startTime={startTime}
              sourceProcesses={serverNameFilters}
              filterOptions={{
                destinationProcesses: { disabled: true, placeholder: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: { placeholder: MetricsLabels.FilterAllSourceProcesses }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default ProcessGroup;
