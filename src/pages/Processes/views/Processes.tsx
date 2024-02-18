import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import SkSearchFilter from '@core/components/SkSearchFilter';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { RequestOptions } from 'API/REST.interfaces';

import { CustomProcessCells, processesSelectOptions, processesTableColumns } from '../Processes.constants';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

//TODO: currently we can't query filter for a multivalue and we need to call separate queries, merge and sort them locally
const initProcessesQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processRole: ['remote', 'external'],
  endTime: 0
};

const Processes = function () {
  const [externalProcessesQueryParams, setExternalProcessesQueryParams] =
    useState<RequestOptions>(initProcessesQueryParams);

  const { data: processData } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcessesPaginated, externalProcessesQueryParams],
    queryFn: () => RESTApi.fetchProcesses(externalProcessesQueryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: RequestOptions) => {
    startTransition(() => {
      setExternalProcessesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
    });
  }, []);

  const processes = processData?.results || [];
  const processesCount = processData?.timeRangeCount || 0;

  return (
    <MainContainer
      dataTestId={getTestsIds.processesView()}
      title={ProcessesLabels.Section}
      description={ProcessesLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Processes}`}
      mainContentChildren={
        <>
          <SkSearchFilter onSearch={handleGetFilters} selectOptions={processesSelectOptions} />

          <SkTable
            columns={processesTableColumns}
            rows={processes}
            customCells={CustomProcessCells}
            pagination={true}
            paginationTotalRows={processesCount}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFilters}
          />
        </>
      }
    />
  );
};

export default Processes;
