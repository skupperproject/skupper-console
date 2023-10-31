import { FC, Suspense, useCallback, useRef, useState } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';

import MetricFilters from './components/Filters';
import Latency from './components/Latency';
import Request from './components/Request';
import Response from './components/Response';
import TcpConnection from './components/TcpConnection';
import Traffic from './components/Traffic';
import { MetricsProps, QueryMetricsParams } from './Metrics.interfaces';

const Metrics: FC<MetricsProps> = function ({
  configFilters, // General configuration for filters (e.g., hide/show, enable/disable)
  defaultMetricFilterValues, // Initial values when the component mounts for filters
  defaultOpenSections, // Initial values when the component mounts for opened/closed metric sections
  sourceSites, // List of source sites used to populate the filter options
  destSites, // List of destination sites used in the filter
  sourceProcesses, // List of source processes for filtering
  destProcesses, // List of destination processes for filtering
  availableProtocols, // List of available protocols for filtering
  startTimeLimit, // Use startTimeLimit to set the left temporal limit of the SelectTimeInterval filter
  onGetMetricFiltersConfig, // Function to retrieve the filter configuration
  onGetExpandedSectionsConfig // Function to retrieve the open/close status of metric sections
}) {
  const { refreshDataInterval: defaultRefreshDataInterval, ...filters } = defaultMetricFilterValues;

  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [refetchInterval, setRefetchInterval] = useState(defaultRefreshDataInterval);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);
  // keep track of the the open/close status sections
  const expandedSectionsConfigRef = useRef(defaultOpenSections);

  //Filters: refetch manually the prometheus API
  const handleShouldUpdateData = useCallback(() => {
    setShouldUpdateData(new Date().getTime());
  }, []);

  // Filters: Set the prometheus query params with the filter values
  const handleUpdateQueryParams = useCallback(
    (updatedFilters: QueryMetricsParams, refreshDataInterval?: number) => {
      setRefetchInterval(refreshDataInterval);
      setQueryParams(updatedFilters);

      if (onGetMetricFiltersConfig) {
        onGetMetricFiltersConfig({ ...updatedFilters, refreshDataInterval });
      }
    },
    [onGetMetricFiltersConfig]
  );

  const handleUpdateExpandedSections = useCallback(
    (section: Record<string, boolean>) => {
      if (onGetExpandedSectionsConfig) {
        const config = { ...expandedSectionsConfigRef.current, ...section };

        onGetExpandedSectionsConfig(config);
        expandedSectionsConfigRef.current = config;
      }
    },
    [onGetExpandedSectionsConfig]
  );

  // case: hide if We select TCP from the protocol filter or the protocol list has only 1 item and this item is TCP
  const showHttp =
    queryParams.protocol !== AvailableProtocols.Tcp &&
    !(availableProtocols?.length === 1 && availableProtocols[0] === AvailableProtocols.Tcp);

  const showTcp = !queryParams.protocol || queryParams.protocol === AvailableProtocols.Tcp;

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
          onRefetch={handleShouldUpdateData}
          onSelectFilters={handleUpdateQueryParams}
        />
      </StackItem>

      <StackItem>
        <Suspense fallback={<div />}>
          <Traffic
            selectedFilters={queryParams}
            forceUpdate={shouldUpdateData}
            refetchInterval={refetchInterval}
            openSections={defaultOpenSections?.byterate}
            onGetIsSectionExpanded={handleUpdateExpandedSections}
          />
        </Suspense>
      </StackItem>

      {showTcp && (
        <StackItem>
          <Suspense fallback={<div />}>
            <TcpConnection
              selectedFilters={queryParams}
              forceUpdate={shouldUpdateData}
              refetchInterval={refetchInterval}
              openSections={defaultOpenSections?.connection}
              onGetIsSectionExpanded={handleUpdateExpandedSections}
            />
          </Suspense>
        </StackItem>
      )}

      {showHttp && (
        <>
          <StackItem>
            <Suspense fallback={<div />}>
              <Latency
                selectedFilters={queryParams}
                openSections={defaultOpenSections?.latency}
                forceUpdate={shouldUpdateData}
                refetchInterval={refetchInterval}
                onGetIsSectionExpanded={handleUpdateExpandedSections}
              />
            </Suspense>
          </StackItem>

          <StackItem>
            <Suspense fallback={<div />}>
              <Request
                selectedFilters={queryParams}
                openSections={defaultOpenSections?.request}
                forceUpdate={shouldUpdateData}
                refetchInterval={refetchInterval}
                onGetIsSectionExpanded={handleUpdateExpandedSections}
              />
            </Suspense>
          </StackItem>

          <StackItem>
            <Suspense fallback={<div />}>
              <Response
                selectedFilters={queryParams}
                openSections={defaultOpenSections?.response}
                forceUpdate={shouldUpdateData}
                refetchInterval={refetchInterval}
                onGetIsSectionExpanded={handleUpdateExpandedSections}
              />
            </Suspense>
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default Metrics;
