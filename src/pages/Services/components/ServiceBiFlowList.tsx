import { FC, useCallback, useState, startTransition } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkBiFlowList from '@core/components/SkBiFlowList';
import { SkSelectOption } from '@core/components/SkSelect';
import SkSearchFilter from '@core/components/SkTable/SkSearchFilter';
import { BiFlowResponse, QueryFilters } from '@sk-types/REST.interfaces';
import { SKTableColumn } from 'types/SkTable.interfaces';

import { QueriesServices } from '../Services.enum';

interface ServiceBiFlowProps {
  columns: SKTableColumn<BiFlowResponse>[];
  filters: QueryFilters;
  options: SkSelectOption[];
  pagination?: number;
}

const ServiceBiFlow: FC<ServiceBiFlowProps> = function ({
  columns,
  filters,
  options,
  pagination = BIG_PAGINATION_SIZE
}) {
  const [queryParams, setQueryParams] = useState({});

  const { data: biFlow } = useSuspenseQuery({
    queryKey: [QueriesServices.GetBiFlowByService, { ...filters, ...queryParams }],
    queryFn: () => RESTApi.fetchBiFlows({ ...filters, ...queryParams }),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setQueryParams(params);
    });
  }, []);

  return (
    <>
      <SkSearchFilter onSearch={handleGetFilters} selectOptions={options} />

      <SkBiFlowList
        columns={columns}
        rows={biFlow?.results || []}
        paginationTotalRows={biFlow?.timeRangeCount}
        pagination={true}
        paginationPageSize={pagination}
        onGetFilters={handleGetFilters}
      />
    </>
  );
};

export default ServiceBiFlow;
