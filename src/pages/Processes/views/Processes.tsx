import { useCallback, useState } from 'react';

import { Split, SplitItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { TopologyIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import LoadingPage from '@pages/shared/Loading';
import { Labels } from '@pages/Sites/Sites.enum';
import { TopologyRoutesPaths, TopologyViews } from '@pages/Topology/Topology.enum';
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
    <TransitionPage>
      <div data-testid={getTestsIds.processesView()}>
        <Split>
          <SplitItem isFilled>
            <SkTitle title={ProcessesLabels.Section} description={ProcessesLabels.Description} />
          </SplitItem>
          <SplitItem>
            <Toolbar isFullHeight>
              <ToolbarContent>
                <ToolbarGroup alignment={{ default: 'alignRight' }}>
                  <ToolbarItem>
                    <Link to={`${TopologyRoutesPaths.Topology}?type=${TopologyViews.Processes}`}>
                      <Tooltip content={Labels.TopologyView}>
                        <TopologyIcon />
                      </Tooltip>
                    </Link>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </SplitItem>
        </Split>
        <div>
          <SkTable
            columns={processesTableColumns}
            rows={processes}
            customCells={ProcessesComponentsTable}
            pagination={true}
            paginationTotalRows={processesCount}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFilters}
          />
        </div>
      </div>
    </TransitionPage>
  );
};

export default Processes;
