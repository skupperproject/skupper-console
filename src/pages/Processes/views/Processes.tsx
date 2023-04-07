import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import LoadingPage from '@pages/shared/Loading';
import { RequestOptions } from 'API/REST.interfaces';

import { ProcessesComponentsTable, processesTableColumns } from '../Processes.constant';
import { ProcessesLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const PAGINATION_SIZE = 50;

const initProcessesPaginatedQueryParams = {
  limit: PAGINATION_SIZE,
  offset: 0,
  filter: 'processRole.external'
};

const Processes = function () {
  const [ProcessesPaginatedQueryParams, setProcessesPaginatedQueryParams] = useState<RequestOptions>(
    initProcessesPaginatedQueryParams
  );

  const { data: processesData, isLoading: isLoadingProcessesData } = useQuery(
    [QueriesProcesses.GetProcessesPaginated, ProcessesPaginatedQueryParams],
    () => RESTApi.fetchProcesses(ProcessesPaginatedQueryParams),
    {
      keepPreviousData: true
    }
  );

  const handleGetFilters = useCallback((params: RequestOptions) => {
    setProcessesPaginatedQueryParams({ ...initProcessesPaginatedQueryParams, ...params });
  }, []);

  if (isLoadingProcessesData) {
    return <LoadingPage />;
  }

  if (!processesData) {
    return null;
  }

  const processes = processesData.results || [];

  return (
    <TransitionPage>
      <>
        <SkTitle title={ProcessesLabels.Section} description={ProcessesLabels.Description} />
        <div>
          <SkTable
            pageSizeStart={PAGINATION_SIZE}
            columns={processesTableColumns}
            rows={processes}
            components={ProcessesComponentsTable}
            onGetFilters={handleGetFilters}
          />
        </div>
      </>
    </TransitionPage>
  );
};

export default Processes;
