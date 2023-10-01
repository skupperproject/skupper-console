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
import { displayIntervalMap } from './Metrics.constants';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps, SelectedFilters, QueriesMetrics, QueryMetricsParams } from './Metrics.interfaces';
import MetricsController from './services';

function getDisplayIntervalValue(value: string | undefined) {
  return displayIntervalMap.find(({ key }) => key === value)?.value || 0;
}

const Metrics: FC<MetricsProps> = function ({
  selectedFilters,
  startTime,
  sourceSites,
  destSites,
  sourceProcesses,
  processesConnected,
  availableProtocols,
  filterOptions,
  openSections,
  onGetMetricFilters
}) {
  const { displayInterval, ...initialQueryParams } = selectedFilters;
  const [refetchInterval, setRefetchInterval] = useState(getDisplayIntervalValue(displayInterval));
  const [qeryParams, setQueryParams] = useState<QueryMetricsParams>(initialQueryParams);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);

  const { data: metrics, isRefetching } = useQuery(
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
    (updatedFilters: SelectedFilters) => {
      const { displayInterval: refetchInteval, ...queryParams } = updatedFilters;
      setQueryParams(queryParams);
      setRefetchInterval(getDisplayIntervalValue(refetchInteval));

      if (onGetMetricFilters) {
        onGetMetricFilters(queryParams);
      }
    },
    [onGetMetricFilters]
  );

  const areDataAvailable = !!metrics?.byteRateData.txTimeSerie || !!metrics?.byteRateData.rxTimeSerie;

  return (
    <Stack hasGutter>
      <StackItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <MetricFilters
          availableProtocols={availableProtocols}
          sourceSites={sourceSites}
          destSites={destSites}
          sourceProcesses={sourceProcesses}
          processesConnected={processesConnected}
          initialFilters={selectedFilters}
          customFilterOptions={filterOptions}
          startTime={startTime}
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
