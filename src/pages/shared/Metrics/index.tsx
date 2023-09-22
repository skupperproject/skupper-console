import { FC, useCallback, useState } from 'react';

import { Card, CardBody, Stack, StackItem } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { AvailableProtocols } from '@API/REST.enum';
import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';

import Latency from './components/Latency';
import Request from './components/Request';
import Traffic from './components/Traffic';
import MetricFilters from './Filters';
import { displayIntervalMap } from './Metrics.constants';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps, SelectedFilters } from './Metrics.interfaces';
import MetricsController from './services';
import { QueriesMetrics, QueryMetricsParams } from './services/services.interfaces';

function getDisplayIntervalValue(value: string | undefined) {
  return displayIntervalMap.find(({ key }) => key === value)?.value || 0;
}

const Metrics: FC<MetricsProps> = function ({
  selectedFilters,
  startTime,
  sourceProcesses,
  processesConnected,
  availableProtocols,
  filterOptions,
  openSections,
  onGetMetricFilters
}) {
  const { displayInterval, ...queryInit } = selectedFilters;
  const [refetchInterval, setRefetchInterval] = useState(getDisplayIntervalValue(displayInterval));
  const [prometheusQueryParams, setPrometheusQueryParams] = useState<QueryMetricsParams>(queryInit);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);

  const {
    data: metrics,
    isRefetching,
    refetch
  } = useQuery(
    [QueriesMetrics.GetTraffic, prometheusQueryParams],
    () => MetricsController.getTraffic(prometheusQueryParams),
    {
      enabled: isPrometheusActive,
      refetchInterval,
      keepPreviousData: true
    }
  );

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    isPrometheusActive && refetch();
    setShouldUpdateData(new Date().getTime());
  }, [refetch]);

  // Filters: Set the prometheus query params with the filter values
  const handleFilters = useCallback(
    (updatedFilters: SelectedFilters) => {
      const { displayInterval: displayIntervalSelected, ...prometheusParams } = updatedFilters;

      const filters: QueryMetricsParams = {
        ...prometheusParams,
        processIdSource: updatedFilters.processIdSource || selectedFilters.processIdSource
      };

      setPrometheusQueryParams(filters);
      setRefetchInterval(getDisplayIntervalValue(displayIntervalSelected));

      if (onGetMetricFilters) {
        onGetMetricFilters({ ...filters, displayInterval: displayIntervalSelected });
      }
    },
    [onGetMetricFilters, selectedFilters.processIdSource]
  );

  if (!metrics) {
    return (
      <Card isFullHeight>
        <CardBody>
          <EmptyData
            message={MetricsLabels.NoMetricFoundTitleMessage}
            description={MetricsLabels.NoMetricFoundDescriptionMessage}
            icon={SearchIcon}
          />
        </CardBody>
      </Card>
    );
  }

  const { byteRateData } = metrics;
  const areDataAvailable = !!byteRateData;

  return (
    <Stack hasGutter>
      {areDataAvailable && (
        <>
          <StackItem>
            <MetricFilters
              availableProtocols={availableProtocols}
              sourceProcesses={sourceProcesses}
              processesConnected={processesConnected}
              initialFilters={{
                ...selectedFilters,
                // if idSource have more ids set default (undefined)
                processIdSource:
                  selectedFilters.processIdSource.split('|').length > 1 ? undefined : selectedFilters.processIdSource
              }}
              customFilterOptions={filterOptions}
              startTime={startTime}
              isRefetching={isRefetching}
              onRefetch={handleRefetchMetrics}
              onSelectFilters={handleFilters}
            />
          </StackItem>
          <StackItem>
            <Traffic
              selectedFilters={prometheusQueryParams}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
            />
          </StackItem>
          {prometheusQueryParams.protocol !== AvailableProtocols.Tcp && (
            <>
              <StackItem>
                <Latency
                  selectedFilters={prometheusQueryParams}
                  openSections={openSections?.latency}
                  forceUpdate={shouldUpdateData}
                  refetchInterval={refetchInterval}
                />
              </StackItem>

              <StackItem>
                <Request
                  selectedFilters={prometheusQueryParams}
                  openSections={openSections?.request}
                  forceUpdate={shouldUpdateData}
                  refetchInterval={refetchInterval}
                />
              </StackItem>
            </>
          )}
        </>
      )}

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
    </Stack>
  );
};

export default Metrics;
