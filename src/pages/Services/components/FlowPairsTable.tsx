import { FC, useCallback, useState, startTransition } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkFlowPairsTable from '@core/components/SkFlowPairsTable';
import SkSearchFilter from '@core/components/SkTable/SkSearchFilter';
import { FlowPairsResponse, QueryFilters } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { QueriesServices } from '../Services.enum';

interface FlowPairsTableProps {
  columns: SKTableColumn<FlowPairsResponse>[];
  filters: QueryFilters;
  options: { id: string; name: string }[];
  pagination?: number;
}

const FlowPairsTable: FC<FlowPairsTableProps> = function ({
  columns,
  filters,
  options,
  pagination = BIG_PAGINATION_SIZE
}) {
  const [queryParams, setQueryParams] = useState({});

  const { data: flowPairsData } = useSuspenseQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, { ...filters, ...queryParams }],
    queryFn: () => RESTApi.fetchFlowPairs({ ...filters, ...queryParams }),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setQueryParams(params);
    });
  }, []);

  const flowPairs = flowPairsData?.results || [];
  const flowPairsCount = flowPairsData?.timeRangeCount;

  return (
    <>
      <SkSearchFilter onSearch={handleGetFilters} selectOptions={options} />

      <SkFlowPairsTable
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

export default FlowPairsTable;
