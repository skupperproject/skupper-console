import { useCallback, useState, startTransition } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';
import { NonNullableValue, SKTableColumn } from 'types/SkTable.interfaces';

import { getAllHttpRequests, getAllTcpConnections } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import SkBiFlowList from '../../../core/components/SkBiFlowList';
import { SkSelectOption } from '../../../core/components/SkSelect';
import SkSearchFilter from '../../../core/components/SkTable/SkSearchFilter';
import { BiFlowResponse, QueryFilters } from '../../../types/REST.interfaces';

interface BiFlowProps<T extends BiFlowResponse> {
  columns: SKTableColumn<NonNullableValue<T>>[];
  filters: QueryFilters;
  options?: SkSelectOption[];
  pagination?: number;
  showAppplicationFlows?: boolean;
}

const BiFlowLogs = function <T extends BiFlowResponse>({
  columns,
  filters,
  options,
  pagination = BIG_PAGINATION_SIZE,
  showAppplicationFlows = false
}: BiFlowProps<T>) {
  const [queryParams, setQueryParams] = useState({});

  const [{ data: transportFlows }, { data: applicationFlows }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllTcpConnections(), { ...filters, ...queryParams }],
        queryFn: () => (!showAppplicationFlows ? RESTApi.fetchTransportFlows({ ...filters, ...queryParams }) : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllHttpRequests(), { ...filters, ...queryParams }],
        queryFn: () => (showAppplicationFlows ? RESTApi.fetchApplicationFlows({ ...filters, ...queryParams }) : null),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleGetFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setQueryParams(params);
    });
  }, []);

  const biFlows = showAppplicationFlows ? applicationFlows : transportFlows;

  return (
    <>
      {options && <SkSearchFilter onSearch={handleGetFilters} selectOptions={options} />}

      <SkBiFlowList
        columns={columns}
        rows={(biFlows?.results as NonNullableValue<T>[]) || []}
        paginationTotalRows={biFlows?.timeRangeCount}
        pagination={true}
        paginationPageSize={pagination}
        onGetFilters={handleGetFilters}
      />
    </>
  );
};

export default BiFlowLogs;
