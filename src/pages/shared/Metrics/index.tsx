import { FC, useCallback, useState } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Traffic from './components/Traffic';
import { MetricsProps, QueryMetricsParams } from './Metrics.interfaces';

const Metrics: FC<MetricsProps> = function ({
  configFilters,
  defaultMetricFilterValues,
  sourceSites,
  destSites,
  sourceProcesses,
  destProcesses,
  availableProtocols,
  startTimeLimit, // Use startTimeLimit to set the left temporal limit of the SelectTimeInterval filter
  openSections,
  onGetMetricFilters
}) {
  const { refreshDataInterval: defaultRefreshDataInterval, ...filters } = defaultMetricFilterValues;

  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [refetchInterval, setRefetchInterval] = useState(defaultRefreshDataInterval);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);

  //Filters: refetch manually the prometheus API
  const handleShouldUpdateData = useCallback(() => {
    setShouldUpdateData(new Date().getTime());
  }, []);

  // Filters: Set the prometheus query params with the filter values
  const handleUpdateQueryParams = useCallback(
    (updatedFilters: QueryMetricsParams, refreshDataInterval?: number) => {
      setRefetchInterval(refreshDataInterval);
      setQueryParams(updatedFilters);
      if (onGetMetricFilters) {
        onGetMetricFilters({ ...updatedFilters, refreshDataInterval });
      }
    },
    [onGetMetricFilters]
  );

  return (
    <Stack hasGutter>
      <StackItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MetricFilters
          configFilters={configFilters}
          defaultMetricFilterValues={defaultMetricFilterValues}
          defaultRefreshDataInterval={defaultRefreshDataInterval}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          destProcesses={destProcesses}
          availableProtocols={availableProtocols}
          startTimeLimit={startTimeLimit}
          isRefetching={false}
          onRefetch={handleShouldUpdateData}
          onSelectFilters={handleUpdateQueryParams}
        />
      </StackItem>

      <StackItem>
        <Traffic selectedFilters={queryParams} forceUpdate={shouldUpdateData} refetchInterval={refetchInterval} />
      </StackItem>

      {queryParams.protocol !== AvailableProtocols.Tcp && (
        <>
          <StackItem>
            <Latency
              selectedFilters={queryParams}
              openSections={openSections?.latency}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
            />
          </StackItem>

          <StackItem>
            <Request
              selectedFilters={queryParams}
              openSections={openSections?.request}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
            />
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default Metrics;
