import { FC, useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkSearchFilter from '@core/components/SkSearchFilter';
import { SKColumn } from '@core/components/SkTable/SkTable.interfaces';
import FlowPairs from '@pages/shared/FlowPairs';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { QueriesServices } from '../Services.enum';

interface FlowPairsServiceTableProps {
  serviceId: string;
  columns: SKColumn<FlowPairsResponse>[];
  filters: RequestOptions;
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

  const { data: flowPairsData } = useQuery(
    [QueriesServices.GetFlowPairsByService, serviceId, { ...filters, ...queryParams }],
    () => RESTApi.fetchFlowPairsByService(serviceId, { ...filters, ...queryParams }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const handleGetFilters = useCallback((params: RequestOptions) => {
    setQueryParams(params);
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
