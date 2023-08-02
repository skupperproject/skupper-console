import { useCallback } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds.config';
import SkTable from '@core/components/SkTable';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constants';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import { QueriesProcessGroups } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'component-display-interval';

const ProcessGroup = function () {
  const { id } = useParams() as { id: string };
  const { id: processGroupId } = getIdAndNameFromUrlParams(id);

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

  const { name } = processGroup;

  const processResults = processes.results;
  const serverNameFilters = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));
  const serverNames = processResults.map(({ name: processName }) => processName).join('|');
  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  return (
    <MainContainer
      dataTestId={getTestsIds.componentView(processGroupId)}
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.ProcessGroups}&${TopologyURLFilters.IdSelected}=${processGroupId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <SkTable
              title={ProcessesLabels.Section}
              columns={processesTableColumns}
              rows={processResults}
              customCells={{
                linkCell: ProcessesComponentsTable.linkCell,
                linkCellSite: ProcessesComponentsTable.linkCellSite,
                exposedCell: ProcessesComponentsTable.exposedCell
              }}
            />
          </StackItem>

          {/* Component Metrics*/}

          <StackItem isFilled>
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
          </StackItem>
        </Stack>
      }
    />
  );
};

export default ProcessGroup;
