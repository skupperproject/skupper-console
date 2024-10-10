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
  showAppplicationFlows?: boolean;
}

const ServiceBiFlowList: FC<ServiceBiFlowProps> = function ({
  columns,
  filters,
  options,
  pagination = BIG_PAGINATION_SIZE,
  showAppplicationFlows = false
}) {
  const [queryParams, setQueryParams] = useState({});

  const { data: transportFlows } = useSuspenseQuery({
    queryKey: [QueriesServices.GetTransportFlows, { ...filters, ...queryParams }],
    queryFn: () => (!showAppplicationFlows ? RESTApi.fetchTransportFlows({ ...filters, ...queryParams }) : null),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: applicationFlows } = useSuspenseQuery({
    queryKey: [QueriesServices.GetApplicationFlows, { ...filters, ...queryParams }],
    queryFn: () => (showAppplicationFlows ? RESTApi.fetchApplicationFlows({ ...filters, ...queryParams }) : null),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setQueryParams(params);
    });
  }, []);

  const biFlows = showAppplicationFlows ? applicationFlows : transportFlows;

  return (
    <>
      <SkSearchFilter onSearch={handleGetFilters} selectOptions={options} />

      <SkBiFlowList
        columns={columns}
        rows={biFlows?.results || []}
        paginationTotalRows={biFlows?.timeRangeCount}
        pagination={true}
        paginationPageSize={pagination}
        onGetFilters={handleGetFilters}
      />
    </>
  );
};

export default ServiceBiFlowList;
