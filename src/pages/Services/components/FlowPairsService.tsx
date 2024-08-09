import { FC, useCallback, useState, startTransition } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkSearchFilter from '@core/components/SkTable/SkSearchFilter';
import FlowPairs from '@pages/shared/FlowPairs';
import { FlowPairsResponse, RemoteFilterOptions } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { QueriesServices } from '../Services.enum';

interface FlowPairsServiceTableProps {
  serviceId: string;
  columns: SKTableColumn<FlowPairsResponse>[];
  filters: RemoteFilterOptions;
  options: { id: string; name: string }[];
  pagination?: number;
}

const FlowPairsService: FC<FlowPairsServiceTableProps> = function ({
  serviceId,
  columns,
  filters,
  options,
  pagination = BIG_PAGINATION_SIZE
}) {
  const [queryParams, setQueryParams] = useState({});

  const { data: flowPairsData } = useSuspenseQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, serviceId, { ...filters, ...queryParams }],
    queryFn: () => RESTApi.fetchFlowPairsByService(serviceId, { ...filters, ...queryParams }),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: RemoteFilterOptions) => {
    startTransition(() => {
      setQueryParams(params);
    });
  }, []);

  const flowPairs = flowPairsData?.results || [];
  const flowPairsCount = flowPairsData?.timeRangeCount;

  return (
    <>
      <SkSearchFilter onSearch={handleGetFilters} selectOptions={options} />

      <FlowPairs
        columns={columns}
        rows={flowPairs}
        paginationTotalRows={flowPairsCount}
        pagination={true}
        paginationPageSize={pagination}
        onGetFilters={handleGetFilters}
      />
    </>
  );
};

export default FlowPairsService;
