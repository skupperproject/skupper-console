import { useCallback, useState, startTransition } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { RemoteFilterOptions } from 'API/REST.interfaces';

import { CustomComponentCells, processGroupsColumns } from '../ProcessGroups.constants';
import { ProcessGroupsLabels, QueriesProcessGroups } from '../ProcessGroups.enum';

const initComponentsQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processGroupRole: ['remote', 'external'],
  endTime: 0
};

const ProcessGroups = function () {
  const [componentsQueryParams, setComponentsQueryParams] = useState<RemoteFilterOptions>(initComponentsQueryParams);

  const { data: componentsData } = useSuspenseQuery({
    queryKey: [QueriesProcessGroups.GetProcessGroups, componentsQueryParams],
    queryFn: () => RESTApi.fetchProcessGroups(componentsQueryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: RemoteFilterOptions) => {
    startTransition(() => {
      setComponentsQueryParams({ ...initComponentsQueryParams, ...params });
    });
  }, []);

  const components = componentsData?.results;
  const componentsCount = componentsData?.timeRangeCount;

  return (
    <MainContainer
      dataTestId={getTestsIds.componentsView()}
      title={ProcessGroupsLabels.Section}
      description={ProcessGroupsLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.ProcessGroups}`}
      mainContentChildren={
        <SkTable
          columns={processGroupsColumns}
          rows={components}
          pagination={true}
          paginationPageSize={BIG_PAGINATION_SIZE}
          paginationTotalRows={componentsCount}
          onGetFilters={handleGetFilters}
          customCells={CustomComponentCells}
        />
      }
    />
  );
};

export default ProcessGroups;
