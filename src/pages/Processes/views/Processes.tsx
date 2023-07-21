import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import SkTable from '@core/components/SkTable';
import SkDefaultPage from '@layout/DefaultPage';
import LoadingPage from '@pages/shared/Loading';
import { TopologyLabels, TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { RequestOptions } from 'API/REST.interfaces';

import { ProcessesComponentsTable, processesTableColumns } from '../Processes.constant';
import { ProcessesLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const initPaginatedProcessesQueryParams = {
  limit: BIG_PAGINATION_SIZE
};

const Processes = function () {
  const [processesPaginatedQueryParams, setProcessesPaginatedQueryParams] = useState<RequestOptions>(
    initPaginatedProcessesQueryParams
  );

  const { data: processesData, isLoading: isLoadingProcessesData } = useQuery(
    [QueriesProcesses.GetProcessesPaginated, processesPaginatedQueryParams],
    () => RESTApi.fetchProcesses(processesPaginatedQueryParams),
    {
      keepPreviousData: true
    }
  );

  const handleGetFilters = useCallback((params: RequestOptions) => {
    setProcessesPaginatedQueryParams({ ...initPaginatedProcessesQueryParams, ...params });
  }, []);

  if (isLoadingProcessesData) {
    return <LoadingPage />;
  }

  if (!processesData) {
    return null;
  }

  const processes = processesData.results.filter(({ processRole }) => processRole !== 'internal');
  const processesCount = processesData.timeRangeCount;

  return (
    <SkDefaultPage
      dataTestId={getTestsIds.processesView()}
      title={ProcessesLabels.Section}
      description={ProcessesLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Processes}`}
      linkLabel={TopologyLabels.Topology}
      mainContentChildren={
        <SkTable
          columns={processesTableColumns}
          rows={processes}
          customCells={ProcessesComponentsTable}
          pagination={true}
          paginationTotalRows={processesCount}
          paginationPageSize={BIG_PAGINATION_SIZE}
          onGetFilters={handleGetFilters}
        />
      }
    />
  );
};

export default Processes;
