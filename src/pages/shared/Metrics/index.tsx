import { FC, useCallback, useState } from 'react';

import { Card, CardBody, Stack, StackItem } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { AvailableProtocols } from '@API/REST.enum';
import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Traffic from './components/Traffic';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps, QueriesMetrics, QueryMetricsParams } from './Metrics.interfaces';
import MetricsController from './services';

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
  const { refreshDataInterval, ...queryParams } = defaultMetricFilterValues;

  const [qeryParams, setQueryParams] = useState<QueryMetricsParams>(queryParams);
  const [refetchInterval, setRefetchInterval] = useState(refreshDataInterval);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);

  const { data: byteRateData, isRefetching } = useQuery(
    [QueriesMetrics.GetTraffic, qeryParams],
    () => MetricsController.getTraffic(qeryParams),
    {
      enabled: isPrometheusActive,
      refetchInterval,
      keepPreviousData: true
    }
  );
  //Filters: refetch manually the prometheus API
  const handleShouldUpdateData = useCallback(() => {
    setShouldUpdateData(new Date().getTime());
  }, []);

  // Filters: Set the prometheus query params with the filter values
  const handleUpdateQueryParams = useCallback(
    (updatedFilters: QueryMetricsParams, refetchDataIntervalSelected?: number) => {
      setRefetchInterval(refetchDataIntervalSelected);
      setQueryParams(updatedFilters);

      if (onGetMetricFilters) {
        onGetMetricFilters({ ...updatedFilters, refreshDataInterval: refetchDataIntervalSelected });
      }
    },
    [onGetMetricFilters]
  );

  const areDataAvailable = !!byteRateData?.txTimeSerie || !!byteRateData?.rxTimeSerie;

  return (
    <Stack hasGutter>
      <StackItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MetricFilters
          configFilters={configFilters}
          defaultMetricFilterValues={queryParams}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          destProcesses={destProcesses}
          availableProtocols={availableProtocols}
          startTimeLimit={startTimeLimit}
          refreshDataInterval={refreshDataInterval}
          isRefetching={isRefetching}
          onRefetch={handleShouldUpdateData}
          onSelectFilters={handleUpdateQueryParams}
        />
      </StackItem>
      {!areDataAvailable && (
        <StackItem isFilled>
          <Card isFullHeight>
            <CardBody>
              <EmptyData
                message={MetricsLabels.NoMetricFoundTitleMessage}
                description={MetricsLabels.NoMetricFoundDescriptionMessage}
                icon={SearchIcon}
              />
            </CardBody>
          </Card>
        </StackItem>
      )}

      {areDataAvailable && (
        <>
          <StackItem>
            <Traffic selectedFilters={qeryParams} forceUpdate={shouldUpdateData} refetchInterval={refetchInterval} />
          </StackItem>
          {qeryParams.protocol !== AvailableProtocols.Tcp && (
            <>
              <StackItem>
                <Latency
                  selectedFilters={qeryParams}
                  openSections={openSections?.latency}
                  forceUpdate={shouldUpdateData}
                  refetchInterval={refetchInterval}
                />
              </StackItem>

              <StackItem>
                <Request
                  selectedFilters={qeryParams}
                  openSections={openSections?.request}
                  forceUpdate={shouldUpdateData}
                  refetchInterval={refetchInterval}
                />
              </StackItem>
            </>
          )}
        </>
      )}
    </Stack>
  );
};

export default Metrics;
