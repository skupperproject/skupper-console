import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import SearchFilter from '@core/components/skSearchFilter';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
import { RequestOptions } from 'API/REST.interfaces';

import { ProcessesComponentsTable, processesSelectOptions, processesTableColumns } from '../Processes.constants';
import { ProcessesLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

//TODO: currently we can't query filter for a multivalue and we need to call separate queries, merge and sort them locally
const initExternalProcessesQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processRole: 'external'
};

const initRemoteProcessesQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processRole: 'remote'
};

const Processes = function () {
  const [externalProcessesQueryParams, setExternalProcessesdQueryParams] = useState<RequestOptions>(
    initExternalProcessesQueryParams
  );
  const [remoteProcessesQueryParams, setRemoteProcessesQueryParams] =
    useState<RequestOptions>(initRemoteProcessesQueryParams);

  const { data: externalProcessData } = useQuery(
    [QueriesProcesses.GetProcessesPaginated, externalProcessesQueryParams],
    () => RESTApi.fetchProcesses(externalProcessesQueryParams),
    {
      keepPreviousData: true
    }
  );

  const { data: remoteProcessData } = useQuery(
    [QueriesProcesses.GetRemoteProcessesPaginated, remoteProcessesQueryParams],
    () => RESTApi.fetchProcesses(remoteProcessesQueryParams),
    {
      keepPreviousData: true
    }
  );

  const handleGetFilters = useCallback(
    (params: RequestOptions) => {
      setExternalProcessesdQueryParams({ ...externalProcessesQueryParams, ...params });
      setRemoteProcessesQueryParams({ ...remoteProcessesQueryParams, ...params });
    },
    [externalProcessesQueryParams, remoteProcessesQueryParams]
  );

  const externalProcesses = externalProcessData?.results || [];
  const externalProcessesCount = externalProcessData?.timeRangeCount || 0;
  const remotelProcesses = remoteProcessData?.results || [];
  const remoteProcessesCount = remoteProcessData?.timeRangeCount || 0;

  const processes = [...externalProcesses, ...remotelProcesses];
  const processesCount = externalProcessesCount + remoteProcessesCount;

  return (
    <MainContainer
      dataTestId={getTestsIds.processesView()}
      title={ProcessesLabels.Section}
      description={ProcessesLabels.Description}
      link={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Processes}`}
      mainContentChildren={
        <>
          <SearchFilter onSearch={handleGetFilters} selectOptions={processesSelectOptions} />

          <SkTable
            columns={processesTableColumns}
            rows={processes}
            customCells={ProcessesComponentsTable}
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
