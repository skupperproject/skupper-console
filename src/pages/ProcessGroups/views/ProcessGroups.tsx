import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { ProcessGroupResponse, RequestOptions } from 'API/REST.interfaces';

import { processGroupsColumns } from '../ProcessGroups.constant';
import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import { QueriesProcessGroups } from '../services/services.enum';

const initPaginatedProcessGroupsQueryParams = {
  limit: BIG_PAGINATION_SIZE
};

const ProcessGroups = function () {
  const [processGroupsPaginatedQueryParams, setProcessGroupsPaginatedQueryParams] = useState<RequestOptions>(
    initPaginatedProcessGroupsQueryParams
  );

  const { data: processGroupsData, isLoading } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsPaginatedQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsPaginatedQueryParams),
    {
      keepPreviousData: true
    }
  );

  const handleGetFilters = useCallback((params: RequestOptions) => {
    setProcessGroupsPaginatedQueryParams({ ...initPaginatedProcessGroupsQueryParams, ...params });
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!processGroupsData) {
    return null;
  }

  const processGroups =
    processGroupsData.results.filter(({ processGroupRole }) => processGroupRole !== 'internal') || [];
  const processGroupsCount = processGroupsData.timeRangeCount;

  const components = processGroups.filter(({ processGroupRole }) => processGroupRole !== 'internal');

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
          paginationTotalRows={processGroupsCount}
          onGetFilters={handleGetFilters}
          customCells={{
            linkCell: (props: LinkCellProps<ProcessGroupResponse>) =>
              LinkCell({
                ...props,
                type: 'component',
                link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
              })
          }}
        />
      }
    />
  );
};

export default ProcessGroups;
