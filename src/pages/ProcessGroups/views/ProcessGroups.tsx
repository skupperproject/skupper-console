import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import LoadingPage from '@pages/shared/Loading';
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
    <TransitionPage>
      <div data-testid={getTestsIds.componentsView()}>
        <SkTitle title={ProcessGroupsLabels.Section} description={ProcessGroupsLabels.Description} />
        <div>
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
                  type: 'service',
                  link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.name}@${props.data.identity}`
                })
            }}
          />
        </div>
      </div>
    </TransitionPage>
  );
};

export default ProcessGroups;
